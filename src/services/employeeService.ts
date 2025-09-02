// services/employeeService.js
import type { SelectEmployeesList } from '../interface/interfaces';
import authService from './authService';

class EmployeeService {
  async getEmployee() {
    try {
    
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const requestBody = {
        date:date,
        id: user.id,
        database: user.dataBase
      };

      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/employees/GetEmployeeDataAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get employee data');
      }
      const data = await response.json();
console.log('data')

console.log(data)
      // Store employee info in localStorage
      localStorage.setItem('employee', JSON.stringify({
        id: data.id,
        name: data.name,
        image: data.pictureBase64,
        isActive: data.isActive,
        jobScope: data.jobScope,
        expiresAt: data.expiration,
        timeHourReportID:data.timeHourReportID,
        minutesHoursAmount:data.minutesHoursAmount,
        editPermision:true
      }));
      localStorage.setItem("timeHourReportsTypes", JSON.stringify(data.timeHourReportsTypes));
      return {
        success: true,
        message: 'Employee fetched successfully',
        data: data,
      };
    } catch (error) {
      console.error('Get employee error:', error);
      throw error;
    }
  }
async  getUserLocation(): Promise<string> {
  const getPosition = (): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation לא נתמך בדפדפן'));
        return;
      }

      const timeoutId = setTimeout(() => reject(new Error('זמן בקשת המיקום עבר')), 10000);

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

  try {
    const position = await getPosition();
    const { latitude, longitude } = position.coords;

    const response = await fetch(
      `/nominatim/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=he`
    );

    if (!response.ok) throw new Error(`Nominatim error: ${response.status}`);

    const data = await response.json();
    console.log("Response data:", data);

    const address = data.address || {};

    // מנסים להחזיר כתובת מדויקת ככל האפשר
    const houseNumber = address.house_number || '';
    const road = address.road || address.street || address.pedestrian || '';
    const suburb = address.suburb || '';
    const city = address.city || address.town || address.village || address.locality || '';
    const state = address.state || '';
    const country = address.country || '';

    // בונים מחרוזת עם fallback חכם
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
      locationStr = 'מיקום לא ידוע';
    }

    // מוסיפים עיר ומדינה בסוף אם יש
    if (city && city !== locationStr) locationStr += `, ${city}`;
    if (state) locationStr += `, ${state}`;
    if (country) locationStr += `, ${country}`;

    return locationStr;

  } catch (err) {
    console.error('שגיאה בקבלת מיקום:', err);
    return 'מיקום לא זמין';
  }
}

  async clockIn() {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
  
      const employee = authService.getCurrentEmployee();
      if (!employee) throw new Error('employee not authenticated');

      const now = new Date();
      const date = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
     // const time = now.toTimeString().split(' ')[0]; // Format: HH:MM:SS
      const location = localStorage.getItem('location') || '';
      const requestBody = {
        date: date,
        timeHourReportID:employee.timeHourReportID,
        location: location,
        id: user.id,
        database: user.dataBase,
        type: 'clockIn' // או כל פרמטר נוסף שהשרת מצפה לו
      };

      const dynamicBaseUrl = user.urlConnection;
      const endpoint = `${dynamicBaseUrl}/employees/ClockInAsync`; // endpoint מתאים לכניסה

      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

   if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get employee data');
      }
      const data = await response.json();

      return {
        success: true,
        message: 'Employee fetched successfully',
        data: data,
      };
    } catch (error) {
      console.error('Get employee error:', error);
      throw error;
    }
  }
async clockOut() {
  try {
    console.log('clockOut');
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const employee = authService.getCurrentEmployee();
    if (!employee) throw new Error('Employee not authenticated');

    const now = new Date();
    const date = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
//

const location = await this.getUserLocation();
console.log('מיקום המשתמש:', location);
    // ⬇️ Get latest location from geolocation
   

    const requestBody = {
      date: date,
      timeHourReportID: employee.timeHourReportID,
      location: location,
      id: user.id,
      database: user.dataBase,
      type: 'clockOut',
    };

    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/employees/clockOutAsync`;

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to clock out');
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Clock-out successful',
      data: data,
    };
  } catch (error) {
    console.error('Clock out error:', error);
    throw error;
  }
}

async getEmployeesList(){ 
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    const requestBody = {
      database: user.dataBase
    };

    const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
    const endpoint = `${dynamicBaseUrl}/employees/GetEmployees`; // Make sure this is correct

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch employees list");
    }

    const data= await response.json();
    return data;
    console.log("Employees list data:", data);
  } catch (error) {
    console.error("Error fetching employees list:", error);
    return null
  } 
}
}
export default new EmployeeService();