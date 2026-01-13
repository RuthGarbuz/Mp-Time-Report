/**
 * Meeting Validation Logic
 * 
 * Centralized validation class for meeting forms
 */

import type { CalendarDataModal } from '../../../interface/meetingModel';
import type { MeetingFormErrors } from './meetingForm.state';

export class MeetingValidator {
  /**
   * Validates a meeting form
   * 
   * @param meeting - The meeting data to validate
   * @returns Object containing any validation errors
   */
  static validate(meeting: CalendarDataModal | undefined): MeetingFormErrors {
    const errors: MeetingFormErrors = {};

    if (!meeting) return errors;

    // Validate title (required)
    if (!meeting.calendarEventDto.title?.trim()) {
      errors.subject = 'נושא הפגישה הוא שדה חובה';
    }

    // Validate date (required)
    if (!meeting.calendarEventDto.start) {
      errors.date = 'תאריך הפגישה הוא שדה חובה';
    }

    // Validate time duration (for non-all-day events)
    if (!meeting.calendarEventDto.allDay && 
        meeting.calendarEventDto.start && 
        meeting.calendarEventDto.end) {
      
      const startTime = new Date(meeting.calendarEventDto.start).toTimeString().slice(0, 5);
      const endTime = new Date(meeting.calendarEventDto.end).toTimeString().slice(0, 5);

      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);

      const diffMs = end.getTime() - start.getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (diffMs < fiveMinutes) {
        errors.time = 'שעת הסיום חייבת להיות לפחות 5 דקות אחרי שעת ההתחלה';
      }
    }

    return errors;
  }

  /**
   * Validates if employee is selected
   * 
   * @param employeeId - The employee ID to validate
   * @returns Error message if invalid, undefined otherwise
   */
  static validateEmployee(employeeId: number | undefined): string | undefined {
    if (!employeeId || employeeId === 0) {
      return 'נא לבחור עובד';
    }
    return undefined;
  }

  /**
   * Validates recurring meeting configuration
   * 
   * @param meeting - The meeting with recurrence to validate
   * @returns Error message if invalid, undefined otherwise
   */
  static validateRecurrence(meeting: CalendarDataModal): string | undefined {
    if (meeting.calendarEventDto.type !== 1) return undefined;

    const rRule = meeting.calendarEventDto.rRule;
    if (!rRule) {
      return 'הגדרות חזרה חסרות';
    }

    if (!rRule.freq) {
      return 'יש לבחור תדירות חזרה';
    }

    if (rRule.freq === 'weekly' && (!rRule.byweekdays || rRule.byweekdays.length === 0)) {
      return 'יש לבחור לפחות יום אחד בשבוע';
    }

    if (rRule.count && rRule.count < 1) {
      return 'מספר המופעים חייב להיות לפחות 1';
    }

    return undefined;
  }
}
