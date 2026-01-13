/**
 * Time Report Form State
 * 
 * This file defines the form state and error structures for time report forms.
 */


/**
 * Form errors for time report creation/editing
 */
export interface ReportFormErrors {
  time: string;        // Time validation errors
  overlap: string[];   // Overlapping time entries
  general: string;     // General form errors
}

/**
 * Creates initial empty form errors
 */
export const createInitialFormErrors = (): ReportFormErrors => ({
  time: '',
  overlap: [],
  general: ''
});

/**
 * Resets all form errors to empty state
 */
export const resetFormErrors = (): ReportFormErrors => createInitialFormErrors();

/**
 * Checks if form has any errors
 * @param errors - Form errors object
 * @returns true if any errors exist
 */
export const hasFormErrors = (errors: ReportFormErrors): boolean => {
  return !!(errors.time || errors.overlap.length > 0 || errors.general);
};
