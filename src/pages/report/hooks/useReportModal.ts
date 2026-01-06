/**
 * useReportModal Hook
 * 
 * This custom hook manages the state and logic for the report modal form.
 * It handles:
 * - Time validation
 * - Total hours calculation
 * - Form submission
 * - Error handling
 */

import { useState, useEffect } from 'react';
import type { TimeRecord } from '../models';
import {
  calculateTotalHours,
  getWeekRange,
  TimeRecordValidator
} from '../models';

/**
 * Hook props
 */
interface UseReportModalProps {
  isOpen: boolean;
  newReport: TimeRecord;
  setNewReport: React.Dispatch<React.SetStateAction<TimeRecord>>;
  currentWeek: Date;
}

/**
 * Hook return type
 */
interface UseReportModalReturn {
  error: string;
  weekRange: { start: Date; end: Date };
  handleClockInChange: (value: string) => void;
  handleClockOutChange: (value: string) => void;
  handleDateChange: (value: string) => void;
  handleTypeChange: (value: number) => void;
  handleNotesChange: (value: string) => void;
}

/**
 * Custom hook for report modal form management
 */
export const useReportModal = ({
  isOpen,
  newReport,
  setNewReport,
  currentWeek
}: UseReportModalProps): UseReportModalReturn => {
  const [error, setError] = useState<string>('');
  
  /**
   * Calculate week range for date validation
   */
  const weekRange = getWeekRange(currentWeek);

  /**
   * Validate time entries
   */
  const validateTimes = (clockInTime: string, clockOutTime: string): void => {
    const validationError = TimeRecordValidator.validateTimes(clockInTime, clockOutTime);
    setError(validationError);
  };

  /**
   * Handle clock in time change
   */
  const handleClockInChange = (value: string) => {
    setNewReport(prev => ({ ...prev, clockInTime: value }));
    
    // Validate if both times are present
    if (value && newReport.clockOutTime) {
      validateTimes(value, newReport.clockOutTime);
    } else {
      setError('');
    }
  };

  /**
   * Handle clock out time change
   */
  const handleClockOutChange = (value: string) => {
    setNewReport(prev => ({ ...prev, clockOutTime: value }));
    
    // Validate if both times are present
    if (newReport.clockInTime && value) {
      validateTimes(newReport.clockInTime, value);
    } else {
      setError('');
    }
  };

  /**
   * Handle date change
   */
  const handleDateChange = (value: string) => {
    setNewReport(prev => ({ ...prev, date: new Date(value) }));
  };

  /**
   * Handle type change
   */
  const handleTypeChange = (value: number) => {
    setNewReport(prev => ({ 
      ...prev, 
      typeID: value,
      type: value 
    }));
  };

  /**
   * Handle notes change
   */
  const handleNotesChange = (value: string) => {
    setNewReport(prev => ({ ...prev, notes: value }));
  };

  /**
   * Calculate total hours when times change
   */
  useEffect(() => {
    if (newReport.clockInTime && newReport.clockOutTime) {
      const total = calculateTotalHours(newReport.clockInTime, newReport.clockOutTime);
      setNewReport(prev => ({ ...prev, total }));
    }
  }, [newReport.clockInTime, newReport.clockOutTime]);

  /**
   * Reset error when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      setError('');
    }
  }, [isOpen]);

  return {
    error,
    weekRange,
    handleClockInChange,
    handleClockOutChange,
    handleDateChange,
    handleTypeChange,
    handleNotesChange
  };
};
