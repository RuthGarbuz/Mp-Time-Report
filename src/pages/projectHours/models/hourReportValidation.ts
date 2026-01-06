import type { HourReportModal } from './hourReport.model';
import { calculateTotalHours } from './hourReport.model';

export type HourReportValidationErrors = {
  time: string;
  project: string;
  general: string;
};

export type HourReportValidationResult = {
  isValid: boolean;
  errors: HourReportValidationErrors;
};

export class HourReportValidator {
  static validate(report: HourReportModal, reportingType: 'total' | 'time-range'): HourReportValidationResult {
    const errors: HourReportValidationErrors = {
      time: '',
      project: '',
      general: '',
    };

    let isValid = true;

    // Validate project
    if (!report.projectID || report.projectID === 0) {
      errors.project = 'נדרש לבחור פרויקט';
      isValid = false;
    }

    // Validate time range if applicable
    if (reportingType === 'time-range') {
      if (!report.clockInTime || !report.clockOutTime) {
        errors.time = 'נדרש להזין שעת כניסה ויציאה';
        isValid = false;
      } else if (report.clockOutTime < report.clockInTime) {
        errors.time = 'שעת יציאה לא יכולה להיות לפני שעת כניסה';
        isValid = false;
      }
    } else {
      // Validate total hours
      if (!report.total) {
        errors.time = 'נדרש להזין סה"כ שעות';
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  static validateTimeRange(clockInTime: string, clockOutTime: string): boolean {
    if (!clockInTime || !clockOutTime) return false;
    return clockOutTime >= clockInTime;
  }

  static hasChanges(original: HourReportModal, current: HourReportModal): boolean {
    return JSON.stringify(original) !== JSON.stringify(current);
  }

  static prepareForSubmit(report: HourReportModal, reportingType: 'total' | 'time-range'): HourReportModal {
    const prepared = { ...report };

    if (reportingType === 'time-range' && prepared.clockInTime && prepared.clockOutTime) {
      prepared.total = calculateTotalHours(prepared.clockInTime, prepared.clockOutTime);
    }

    return prepared;
  }
}
