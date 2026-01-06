/**
 * Time Report Data Models
 * 
 * This file defines all the TypeScript interfaces and types for time reporting.
 * It includes models for time records, employees, and report types.
 */

import type { TimeRecord } from '../../../interface/HourReportModal';
import type { Employee, TimeHourReportsType } from '../../../interface/TimeHourModel';

/**
 * Re-export existing types for convenience
 */
export type { TimeRecord, Employee, TimeHourReportsType };

/**
 * Week date range interface
 * Used for calculating and displaying week boundaries
 */
export interface WeekRange {
  start: Date;
  end: Date;
}

/**
 * Time report form errors
 * Tracks validation errors in the report form
 */
export interface ReportFormErrors {
  time: string;        // Time validation errors (e.g., end time before start time)
  overlap: string[];   // Overlapping time entries
  general: string;     // General form errors
}

/**
 * Helper Functions
 */

/**
 * Converts time string (HH:MM) to total minutes
 * @param time - Time string in format "HH:MM"
 * @returns Total minutes as number
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Converts minutes to time string (HH:MM)
 * @param minutes - Total minutes
 * @returns Time string in format "HH:MM"
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Calculates total hours between start and end time
 * @param clockInTime - Start time "HH:MM"
 * @param clockOutTime - End time "HH:MM"
 * @returns Total time as "HH:MM" string
 */
export const calculateTotalHours = (clockInTime: string, clockOutTime: string): string => {
  if (clockInTime === '-' || clockOutTime === '-' || !clockInTime || !clockOutTime) {
    return '00:00';
  }

  const clockInMinutes = timeToMinutes(clockInTime);
  const clockOutMinutes = timeToMinutes(clockOutTime);
  const totalMinutes = clockOutMinutes - clockInMinutes;

  if (totalMinutes < 0) {
    return '00:00';
  }

  return minutesToTime(totalMinutes);
};

/**
 * Adds duration to a start time
 * @param startTime - Start time "HH:MM"
 * @param duration - Duration to add "HH:MM"
 * @returns New time as "HH:MM" string
 */
export const addTime = (startTime: string, duration: string): string => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [durationHours, durationMinutes] = duration.split(':').map(Number);

  let totalMinutes = startMinutes + durationMinutes;
  let totalHours = startHours + durationHours;

  if (totalMinutes >= 60) {
    totalMinutes -= 60;
    totalHours += 1;
  }

  // Handle overflow beyond 24 hours
  totalHours = totalHours % 24;

  return `${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}`;
};

/**
 * Calculates total time from multiple time records
 * @param reports - Array of time records
 * @returns Total time as "HH:MM" string
 */
export const getTotalTime = (reports: TimeRecord[]): string => {
  let totalMinutes = 0;

  for (const report of reports) {
    // Only count regular work and work from home (typeID 5 and 6)
    if (report.typeID !== 5 && report.typeID !== 6) continue;
    if (!report.total || !report.total.includes(':')) continue;

    const [hoursStr, minutesStr] = report.total.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (!isNaN(hours) && !isNaN(minutes)) {
      totalMinutes += hours * 60 + minutes;
    }
  }

  return minutesToTime(totalMinutes);
};

/**
 * Counts unique reported days in time records
 * @param reports - Array of time records
 * @returns Number of unique days reported
 */
export const getReportedDaysCount = (reports: TimeRecord[]): number => {
  const uniqueDates = new Set<string>();

  for (const report of reports) {
    // Only count regular work and work from home (typeID 5 and 6)
    if (report.typeID !== 5 && report.typeID !== 6) continue;
    if (report.date) {
      uniqueDates.add(report.date.toString());
    }
  }

  return uniqueDates.size;
};

/**
 * Formats date to DD/MM/YY string
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDateShort = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

/**
 * Formats date to YYYY-MM-DD string (for input fields)
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Converts Date object or string to ISO date string
 * @param date - Date to convert
 * @returns ISO date string or null
 */
export const toDateString = (date: string | Date): string | null => {
  if (!date) return null;
  
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === "string") {
    d = new Date(date);
  } else {
    return null;
  }
  
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
};

/**
 * Formats date to DD-MM-YYYY string (for display)
 * @param date - Date to format
 * @returns Formatted date string
 */
export const toLocalISOString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${d}-${m}-${y}`;
};

/**
 * Calculates week range from a given date
 * Week starts on Sunday (day 0)
 * @param date - Reference date
 * @returns WeekRange object with start and end dates
 */
export const getWeekRange = (date: Date): WeekRange => {
  const start = new Date(date);
  const dayOfWeek = start.getDay(); // 0 = Sunday
  start.setDate(start.getDate() - dayOfWeek);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return { start, end };
};

/**
 * Formats week range for display
 * @param date - Reference date
 * @returns Formatted week range string "DD/MM/YY - DD/MM/YY"
 */
export const formatWeekRange = (date: Date): string => {
  const { start, end } = getWeekRange(date);
  return `${formatDateShort(start)} - ${formatDateShort(end)}`;
};

/**
 * Creates initial empty report with default values
 * @param date - Report date
 * @param employeeMinutes - Employee default hours
 * @returns New TimeRecord object
 */
export const createInitialReport = (date: Date, employeeMinutes?: string): TimeRecord => {
  const calculateClockOutTime = employeeMinutes 
    ? addTime("08:00", employeeMinutes)
    : "17:00";

  return {
    date: date,
    type: 5, // Regular work
    typeID: 5,
    clockInTime: "08:00",
    clockOutTime: calculateClockOutTime,
    notes: ""
  };
};
