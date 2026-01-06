/**
 * Report Models Barrel Export
 * 
 * Central export point for all report-related models, types, and utilities
 */

// Core models and types
export type {
  TimeRecord,
  Employee,
  TimeHourReportsType,
  WeekRange,
  ReportFormErrors
} from './report.model';

// Model helper functions
export {
  timeToMinutes,
  minutesToTime,
  calculateTotalHours,
  addTime,
  getTotalTime,
  getReportedDaysCount,
  formatDateShort,
  formatDateOnly,
  toDateString,
  toLocalISOString,
  getWeekRange,
  formatWeekRange,
  createInitialReport
} from './report.model';

// Validation
export { TimeRecordValidator } from './reportValidation';
export type { ValidationResult } from './reportValidation';

// Form state
export {
  createInitialFormErrors,
  resetFormErrors,
  hasFormErrors
} from './reportForm.state';
