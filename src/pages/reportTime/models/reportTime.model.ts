/**
 * ReportTime Models - Data structures and utility functions for time tracking
 * 
 * This file contains:
 * - Employee interface for time tracking
 * - Time calculation utilities
 * - Date/time formatting helpers
 * - Geolocation utilities
 */

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Employee data structure for time tracking
 */
export interface EmployeeTimeData {
  name: string;
  profileImage: string;
  isActive: boolean;
  startTime: string; // HH:MM:SS format
  endTime: string; // HH:MM:SS format
  minutesHoursAmount: string; // Expected work hours
  totalSecondsReported: number; // Total reported seconds
}

/**
 * Geolocation coordinates
 */
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

// ============================================================================
// Time Calculation Utilities
// ============================================================================

/**
 * Calculates the total effective report time including current session
 * 
 * @param reportedSeconds - Total previously reported seconds
 * @param startTime - Current session start time (HH:MM:SS format)
 * @param isActive - Whether employee is currently clocked in
 * @returns Formatted time string (HH:MM:SS)
 * 
 * Logic:
 * 1. Start with previously reported seconds
 * 2. If employee is active and has a start time:
 *    - Calculate elapsed seconds since start time
 *    - Add to total
 * 3. Convert total seconds to HH:MM:SS format
 */
export function calculateEffectiveReportTime(
  reportedSeconds: number,
  startTime: string | null,
  isActive: boolean
): string {
  let total = reportedSeconds ?? 0;

  // If employee is currently clocked in, add elapsed time
  if (isActive && startTime) {
    try {
      const now = new Date();
      const [hours, minutes, seconds] = startTime.split(':').map(Number);
      
      if (!isNaN(hours) && !isNaN(minutes)) {
        const start = new Date();
        start.setHours(hours, minutes, seconds || 0, 0);
        
        const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
        if (diffSeconds > 0) {
          total += diffSeconds;
        }
      }
    } catch (err) {
      console.warn('Error parsing startTime:', err);
    }
  }

  // Ensure total is a valid number
  if (typeof total !== 'number' || isNaN(total)) {
    total = 0;
  }

  return formatSecondsToTime(total);
}

/**
 * Converts seconds to formatted time string (HH:MM:SS)
 * 
 * @param totalSeconds - Total seconds to format
 * @returns Formatted time string with zero-padded hours, minutes, seconds
 * 
 * Examples:
 * - 3661 seconds -> "01:01:01"
 * - 90 seconds -> "00:01:30"
 * - 0 seconds -> "00:00:00"
 */
export function formatSecondsToTime(totalSeconds: number): string {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// ============================================================================
// Date/Time Formatting
// ============================================================================

/**
 * Formats date in Hebrew locale (DD/MM/YY)
 * 
 * @param date - Date object to format
 * @returns Formatted date string in Hebrew locale
 * 
 * Example: new Date('2024-01-15') -> "15/01/24"
 */
export function formatDateHebrew(date: Date): string {
  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
}

// ============================================================================
// Profile Image Utilities
// ============================================================================

/**
 * Processes profile image data and returns display URL
 * 
 * @param profileImage - Base64 image string or URL
 * @returns Data URL or fallback to default profile image
 * 
 * Logic:
 * - If image exists and is not 'null' string, return data URL
 * - Otherwise return default profile image path
 */
export function getProfileImageUrl(profileImage: string | null | undefined): string {
  const img = profileImage?.trim();
  if (img && img !== 'null' && img !== '') {
    return `data:image/jpeg;base64,${img}`;
  }
  return '/default-profile.png'; // from public/ folder
}

// ============================================================================
// Geolocation Utilities
// ============================================================================

/**
 * Gets user's current geolocation coordinates using browser API
 * 
 * @returns Promise resolving to GeolocationPosition
 * @throws Error if geolocation permission denied or unavailable
 * 
 * Uses high accuracy mode for better precision
 */
export function getCurrentCoordinates(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      { enableHighAccuracy: true }
    );
  });
}

/**
 * Generates Google Maps embed URL from coordinates
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Google Maps embed URL with Hebrew language
 * 
 * URL parameters:
 * - q: Query coordinates
 * - hl: Language (Hebrew)
 * - z: Zoom level (16 = street level)
 * - output: embed mode
 */
export function generateMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}&hl=he&z=16&output=embed`;
}

/**
 * Default fallback location for Tel Aviv
 */
export const DEFAULT_LOCATION = {
  name: 'תל אביב',
  url: 'https://www.google.com/maps?q=Tel+Aviv&hl=he&z=16&output=embed'
} as const;

// ============================================================================
// Employee Data Mapping
// ============================================================================

/**
 * Maps API response to EmployeeTimeData structure
 * 
 * @param apiData - Raw employee data from API
 * @returns Normalized EmployeeTimeData object with fallback values
 * 
 * Handles multiple possible field names and null values
 */
export function mapEmployeeData(apiData: any): EmployeeTimeData {
  return {
    name: apiData.name ?? '',
    profileImage: apiData.image ?? apiData.profileImage ?? '',
    isActive: Boolean(apiData.isActive ?? false),
    startTime: apiData.startTime ?? '',
    endTime: apiData.endTime ?? '',
    minutesHoursAmount: apiData.minutesHoursAmount ?? '',
    totalSecondsReported: Number(
      apiData.totalSecondsReported ?? apiData.reportedSeconds ?? 0
    )
  };
}
