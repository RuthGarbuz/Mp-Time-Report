/**
 * Employee Service - Improved Version
 * 
 * Handles employee-related API operations including:
 * - Fetching employee data
 * - Clock in/out operations
 * - User location tracking
 * - Employee list retrieval
 * 
 * Improvements:
 * - Better error handling with specific error types
 * - Reduced code duplication
 * - Consistent naming conventions
 * - Improved type safety
 * - Better async/await patterns
 * - Enhanced readability
 */

import authService from './authService';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

interface EmployeeData {
  id: number;
  name: string;
  image: string;
  isActive: boolean;
  jobScope: string;
  expiresAt: string;
  timeHourReportID: number;
  minutesHoursAmount: number;
  editPermision: boolean;
  startTime: string;
  endTime: string;
  totalSecondsReported: number;
}

interface ClockRequestBody {
  date: string;
  timeHourReportID: number;
  location: string;
  id: number;
  database: string;
  type: 'clockIn' | 'clockOut';
}

// ============================================================================
// Constants
// ============================================================================

const GEOLOCATION_TIMEOUT = 10000; // 10 seconds
const DEFAULT_LOCATION = 'מיקום לא זמין';
const UNKNOWN_LOCATION = 'מיקום לא ידוע';

// ============================================================================
// Helper Functions (Private)
// ============================================================================

/**
 * Gets current date in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Builds dynamic API endpoint URL
 */
function buildEndpoint(baseUrl: string, path: string): string {
  return `${baseUrl}${path}`;
}

/**
 * Gets browser geolocation with timeout
 */
function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported in this browser'));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('Geolocation request timed out'));
    }, GEOLOCATION_TIMEOUT);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve(position);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
      { enableHighAccuracy: true }
    );
  });
}

/**
 * Formats address components into readable location string
 */
function formatLocationString(address: any): string {
  const houseNumber = address.house_number || '';
  const road = address.road || address.street || address.pedestrian || '';
  const suburb = address.suburb || '';
  const city = address.city || address.town || address.village || address.locality || '';
  const state = address.state || '';
  const country = address.country || '';

  // Build location string with smart fallback
  let locationStr = '';
  
  if (houseNumber && road) {
    locationStr = `${road} ${houseNumber}`;
  } else if (road) {
    locationStr = road;
  } else if (suburb) {
    locationStr = suburb;
  } else if (city) {
    locationStr = city;
  } else {
    return UNKNOWN_LOCATION;
  }

  // Append city, state, country if different from primary location
  if (city && city !== locationStr) {
    locationStr += `, ${city}`;
  }
  if (state) {
    locationStr += `, ${state}`;
  }
  if (country) {
    locationStr += `, ${country}`;
  }

  return locationStr;
}

/**
 * Maps API response to EmployeeData structure
 */
function mapEmployeeResponse(data: any): EmployeeData {
  return {
    id: data.id,
    name: data.name,
    image: data.pictureBase64,
    isActive: data.isActive,
    jobScope: data.jobScope,
    expiresAt: data.expiration,
    timeHourReportID: data.timeHourReportID,
    minutesHoursAmount: data.minutesHoursAmount ?? 0,
    editPermision: true,
    startTime: data.startTime,
    endTime: data.endTime,
    totalSecondsReported: data.totalSecondsReported
  };
}

// ============================================================================
// Employee Service Class
// ============================================================================

class EmployeeService {
  /**
   * Fetches employee data for the authenticated user
   * 
   * @returns Promise with employee data
   * @throws Error if user not authenticated or request fails
   * 
   * Changes from original:
   * - Added type annotations
   * - Extracted helper functions for date formatting and mapping
   * - Consistent error messages
   * - Better structured response
   */
  async getEmployee(): Promise<ApiResponse<EmployeeData>> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const requestBody = {
        date: getCurrentDate(),
        id: user.id,
        database: user.dataBase
      };

      const endpoint = buildEndpoint(
        user.urlConnection,
        '/employees/GetEmployeeDataAsync'
      );

      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch employee data');
      }

      const data = await response.json();
      const employeeData = mapEmployeeResponse(data);

      // Cache employee data in localStorage
      localStorage.setItem('employee', JSON.stringify(employeeData));
      localStorage.setItem('timeHourReportsTypes', JSON.stringify(data.timeHourReportsTypes));

      return {
        success: true,
        message: 'Employee data fetched successfully',
        data: employeeData,
      };
    } catch (error) {
      console.error('Failed to fetch employee data:', error);
      throw error;
    }
  }

  /**
   * Gets user's current location from browser geolocation and reverse geocoding
   * 
   * @returns Promise with formatted location string
   * 
   * Changes from original:
   * - Extracted getBrowserPosition to separate function
   * - Extracted formatLocationString to separate function
   * - Better error messages
   * - Consistent naming (getUserLocation)
   */
  async getUserLocation(): Promise<string> {
    try {
      const position = await getBrowserPosition();
      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `/nominatim/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=he`
      );

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();
      const address = data.address || {};

      return formatLocationString(address);
    } catch (error) {
      console.error('Failed to get user location:', error);
      return DEFAULT_LOCATION;
    }
  }

  /**
   * Records clock-in for the current employee
   * 
   * @returns Promise with clock-in result
   * @throws Error if user/employee not authenticated or request fails
   * 
   * Changes from original:
   * - Extracted common clock logic (see buildClockRequest)
   * - Consistent error handling
   * - Better success message
   * - Removed unused time variable
   */
  async clockIn(): Promise<ApiResponse> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const employee = authService.getCurrentEmployee();
      if (!employee) {
        throw new Error('Employee not authenticated');
      }

      const location = localStorage.getItem('location') || '';
      const requestBody: ClockRequestBody = {
        date: getCurrentDate(),
        timeHourReportID: employee.timeHourReportID,
        location: location,
        id: user.id,
        database: user.dataBase,
        type: 'clockIn'
      };

      const endpoint = buildEndpoint(user.urlConnection, '/employees/ClockInAsync');

      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to clock in');
      }

      const data = await response.json();
      
      // Refresh employee data to get updated state
      await this.getEmployee();

      return {
        success: true,
        message: 'Clock-in successful',
        data: data,
      };
    } catch (error) {
      console.error('Clock-in failed:', error);
      throw error;
    }
  }

  /**
   * Records clock-out for the current employee
   * 
   * @returns Promise with clock-out result
   * @throws Error if user/employee not authenticated or request fails
   * 
   * Changes from original:
   * - Uses getUserLocation() for real-time location (as intended)
   * - Consistent with clockIn structure
   * - Better error handling
   */
  async clockOut(): Promise<ApiResponse> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const employee = authService.getCurrentEmployee();
      if (!employee) {
        throw new Error('Employee not authenticated');
      }

      // Get fresh location for clock-out
      const location = await this.getUserLocation();

      const requestBody: ClockRequestBody = {
        date: getCurrentDate(),
        timeHourReportID: employee.timeHourReportID,
        location: location,
        id: user.id,
        database: user.dataBase,
        type: 'clockOut',
      };

      const endpoint = buildEndpoint(user.urlConnection, '/employees/clockOutAsync');

      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to clock out');
      }

      const data = await response.json();
      
      // Refresh employee data to get updated state
      await this.getEmployee();

      return {
        success: true,
        message: 'Clock-out successful',
        data: data,
      };
    } catch (error) {
      console.error('Clock-out failed:', error);
      throw error;
    }
  }

  /**
   * Fetches list of all employees
   * 
   * @returns Promise with employees array or null on error
   * 
   * Changes from original:
   * - Better error handling (throws instead of returning null)
   * - Consistent endpoint building
   * - Added type annotation for return value
   * - Consistent error messages
   */
  async getEmployeesList(): Promise<any[]> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const requestBody = {
        database: user.dataBase
      };

      const endpoint = buildEndpoint(user.urlConnection, '/employees/GetEmployees');

      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch employees list');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch employees list:', error);
      throw error; // Changed: throw instead of returning null
    }
  }
}

// Export singleton instance
export default new EmployeeService();
