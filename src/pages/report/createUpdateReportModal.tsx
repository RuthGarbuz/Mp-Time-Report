/**
 * ReportModal Component
 * 
 * Modal form for creating and updating time reports.
 * Features:
 * - Date selection with week range validation
 * - Report type selection
 * - Clock in/out time entry
 * - Automatic total hours calculation
 * - Time validation (end time must be after start time)
 * - Scroll locking when open
 * 
 * Refactored to use custom hooks for better separation of concerns.
 */

import { X } from "lucide-react";
import { useEffect } from "react";
import { useModal } from '../ModalContextType';
import { useReportModal } from './hooks';
import { formatDateOnly } from './models';
import ErrorMessage from "../shared/errorMessage";
import AutoComplete from '../shared/autoCompleteInput';

interface ReportModalProps {
  isOpen: boolean;
  title: string;
  newReport: any;
  setNewReport: (data: any) => void;
  typeReports: any[];
  closeModal: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  currentWeek: Date;
  errorMessage: string | null;
}

export default function ReportModal({
  isOpen,
  title,
  newReport,
  setNewReport,
  typeReports,
  closeModal,
  handleSubmit,
  currentWeek,
  errorMessage
}: ReportModalProps) {
  const { openModal, closeModal: closeModalScroll } = useModal();
  
  // Use custom hook for modal form logic
  const {
    error,
    weekRange,
    handleClockInChange,
    handleClockOutChange,
    handleDateChange,
    handleTypeChange,
    handleNotesChange
  } = useReportModal({
    isOpen,
    newReport,
    setNewReport,
    currentWeek
  });

  /**
   * Lock/unlock scroll when modal opens/closes
   */
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModalScroll();
    }
  }, [isOpen, openModal, closeModalScroll]);

  if (!isOpen) return null;

  /**
   * Handle close button click
   */
  const onClose = () => {
  
    closeModal();
  };

  /**
   * Handle form submission
   */
  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (error) {
      return;
    }
    handleSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative pt-1 flex items-center justify-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800 text-center">{title}</h2>
          <button
            onClick={onClose}
            className="absolute left-0 w-8 h-8 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Modal Content */}
          <form onSubmit={submitForm}>
            {errorMessage && (<ErrorMessage validateError={String(errorMessage)} />)}

            {/* Date Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                תאריך הדיווח
              </label>
              <input
                type="date"
                value={formatDateOnly(new Date(newReport.date))}
                onChange={(e) => handleDateChange(e.target.value)}
                min={formatDateOnly(weekRange.start)}
                max={formatDateOnly(weekRange.end)}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Report Type */}
           <div className="relative w-full text-gray-800">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                סוג הדיווח
              </label>
              <AutoComplete
                items={typeReports}
                selectedItem={typeReports.find(t => t.id === newReport.typeID) || null}
                onSelect={(type) => handleTypeChange(type?.id ?? 5)}
                getItemId={(type) => type.id}
                getItemLabel={(type) => type.name}
                placeholder="בחר סוג דיווח..."
                height={2}
              />
            </div>

            {/* clockInTime and clockOutTime Times */}
            <div className="grid grid-cols-2 gap-4">
              <div className="ml-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  שעת כניסה
                </label>
                <input
                  type="time"
                  value={newReport.clockInTime}
                  onChange={(e) => handleClockInChange(e.target.value)}
                  className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  disabled={newReport.typeID === 3}
                />
              </div>
              <div className="mr-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  שעת יציאה
                </label>
                <input
                  type="time"
                  value={newReport.clockOutTime}
                  onChange={(e) => handleClockOutChange(e.target.value)}
                  className={`text-black w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                  } focus:border-transparent`}
                  disabled={newReport.typeID === 3}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {/* Total Hours Display */}
            {newReport.total && newReport.typeID !== 3 && (
              <div className="mt-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-900">סה"כ שעות:</span>
                  <span className="text-lg font-bold text-blue-600">{newReport.total}</span>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                הערות
              </label>
              <textarea
                value={newReport.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                rows={3}
                placeholder="הערות נוספות (אופציונלי)"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                שמור דיווח
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
