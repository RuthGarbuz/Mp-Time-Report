/**
 * Meeting Form State Management
 * 
 * This file handles form state structure and initialization
 * for meeting forms.
 */

// ============================================================================
// Form Error Types
// ============================================================================

export interface MeetingFormErrors {
  subject?: string;
  date?: string;
  time?: string;
  employee?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates an initial empty error state
 */
export function createInitialFormErrors(): MeetingFormErrors {
  return {};
}

/**
 * Resets all errors to empty state
 */
export function resetFormErrors(): MeetingFormErrors {
  return createInitialFormErrors();
}

/**
 * Checks if there are any validation errors
 * 
 * @param errors - The errors object to check
 * @returns true if there are any errors, false otherwise
 */
export function hasFormErrors(errors: MeetingFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
