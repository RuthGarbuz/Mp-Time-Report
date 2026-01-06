/**
 * Time Report Validation
 * 
 * This file contains validation logic for time reports.
 * It checks for time conflicts, overlaps, and data integrity.
 */

import type { TimeRecord } from './report.model';
import { timeToMinutes, formatDateOnly } from './report.model';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  timeError: string;
  overlapErrors: string[];
}

/**
 * TimeRecordValidator
 * Handles all validation logic for time reports
 */
export class TimeRecordValidator {
  /**
   * Validates time entries (clock in/out)
   * @param clockInTime - Start time "HH:MM"
   * @param clockOutTime - End time "HH:MM"
   * @returns Error message or empty string if valid
   */
  static validateTimes(clockInTime: string, clockOutTime: string): string {
    if (!clockInTime || !clockOutTime) {
      return '';
    }

    const clockInMinutes = timeToMinutes(clockInTime);
    const clockOutMinutes = timeToMinutes(clockOutTime);

    if (clockOutMinutes <= clockInMinutes) {
      return 'שעת יציאה לא יכולה להיות לפני שעת כניסה';
    }
    return '';
  }

  /**
   * Checks for overlapping time entries on the same day
   * @param reports - Array of all time records
   * @param currentReport - The report being validated (optional for edit mode)
   * @returns Array of error messages for overlapping entries
   */
  static validateOverlappingReports(
    reports: TimeRecord[],
    currentReport?: TimeRecord
  ): string[] {
    const errors: string[] = [];
    const reportsByDate: { [key: string]: TimeRecord[] } = {};

    // Group reports by date
    for (const report of reports) {
      // Skip the current report if we're editing
      if (currentReport && report.id === currentReport.id) {
        continue;
      }

      if (!report.date) continue;

      const dateKey = formatDateOnly(new Date(report.date));
      if (!reportsByDate[dateKey]) {
        reportsByDate[dateKey] = [];
      }
      reportsByDate[dateKey].push(report);
    }

    // If we have a current report, add it to check for overlaps
    if (currentReport && currentReport.date) {
      const dateKey = formatDateOnly(new Date(currentReport.date));
      if (!reportsByDate[dateKey]) {
        reportsByDate[dateKey] = [];
      }
      reportsByDate[dateKey].push(currentReport);
    }

    // Check each day for overlaps
    for (const [dateKey, dayReports] of Object.entries(reportsByDate)) {
      if (dayReports.length < 2) continue;

      // Convert to time ranges
      const timeRanges = dayReports.map(r => ({
        start: timeToMinutes(r.clockInTime || '00:00'),
        end: timeToMinutes(r.clockOutTime || '00:00'),
        report: r
      }));

      // Sort by start time
      timeRanges.sort((a, b) => a.start - b.start);

      // Check for overlaps
      for (let i = 0; i < timeRanges.length - 1; i++) {
        const current = timeRanges[i];
        const next = timeRanges[i + 1];

        if (current.end > next.start) {
          const [day, month, year] = dateKey.split('-');
          errors.push(
            `זוהתה חפיפה בשעות ביום ${day}/${month}/${year}: ` +
            `${current.report.clockInTime}-${current.report.clockOutTime} ו-` +
            `${next.report.clockInTime}-${next.report.clockOutTime}`
          );
        }
      }
    }

    return errors;
  }

  /**
   * Validates that a date falls within the specified week range
   * @param reportDate - The date to validate
   * @param weekStart - Start of the week
   * @param weekEnd - End of the week
   * @returns Error message or empty string if valid
   */
  static validateWeekRange(
    reportDate: Date,
    weekStart: Date,
    weekEnd: Date
  ): string {
    const reportTime = reportDate.getTime();
    const startTime = weekStart.getTime();
    const endTime = weekEnd.getTime();

    if (reportTime < startTime || reportTime > endTime) {
      return 'תאריך הדיווח חייב להיות בטווח השבוע הנוכחי';
    }

    return '';
  }

  /**
   * Comprehensive validation of a time report
   * @param report - Report to validate
   * @param allReports - All existing reports (for overlap check)
   * @param weekStart - Start of week (optional)
   * @param weekEnd - End of week (optional)
   * @returns ValidationResult with all errors
   */
  static validate(
    report: TimeRecord,
    allReports: TimeRecord[],
    weekStart?: Date,
    weekEnd?: Date
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      timeError: '',
      overlapErrors: []
    };

    // Validate times
    if (report.clockInTime && report.clockOutTime) {
      result.timeError = this.validateTimes(report.clockInTime, report.clockOutTime);
      if (result.timeError) {
        result.isValid = false;
      }
    }

    // Validate week range
    if (weekStart && weekEnd && report.date) {
      const weekError = this.validateWeekRange(
        new Date(report.date),
        weekStart,
        weekEnd
      );
      if (weekError) {
        result.timeError = result.timeError 
          ? `${result.timeError}. ${weekError}`
          : weekError;
        result.isValid = false;
      }
    }

    // Validate overlaps
    result.overlapErrors = this.validateOverlappingReports(allReports, report);
    if (result.overlapErrors.length > 0) {
      result.isValid = false;
    }

    return result;
  }
}
