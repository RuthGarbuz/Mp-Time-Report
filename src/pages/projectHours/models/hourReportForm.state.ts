import type { HourReportModal } from './hourReport.model';

export interface HourReportFormState {
  report: HourReportModal;
  isOpen: boolean;
  editingId: number;
  reportingType: 'total' | 'time-range';
  errors: {
    time: string;
    project: string;
    general: string;
  };
}

export const createInitialFormState = (report: HourReportModal): HourReportFormState => ({
  report,
  isOpen: false,
  editingId: 0,
  reportingType: report.clockInTime && report.clockOutTime ? 'time-range' : 'total',
  errors: {
    time: '',
    project: '',
    general: '',
  },
});

export const resetFormErrors = (state: HourReportFormState): HourReportFormState => ({
  ...state,
  errors: {
    time: '',
    project: '',
    general: '',
  },
});
