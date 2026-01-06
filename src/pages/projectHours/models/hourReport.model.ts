export interface HourReport {
  id: number;
  clockInTime?: string;
  clockOutTime?: string;
  total?: string;
  projectName: string;
  notes?: string;
  date?: Date;
  projectID?: number;
}

export interface HourReportModal {
  id: number;
  date: Date;
  clockInTime?: string;
  clockOutTime?: string;
  notes: string;
  total?: string;
  projectID?: number;
  contractID?: number;
  subContractID?: number;
  stepID?: number;
  hourReportMethodID: number;
  employeeId: number;
  projectName?: string;
}

export interface Contract {
  id: number;
  name: string;
}

export interface SubContract {
  id: number;
  name: string;
  contractID: number;
}

export interface Step {
  id: number;
  name: string;
  subContractID?: number;
}

export interface HourReportStepsModal {
  contractsList: Contract[];
  subContractsList: SubContract[];
  stepsList: Step[];
}

export interface CheckHoursOverlapQuery {
  projectID: number;
  employeeID: number;
  date: Date;
  clockInTime?: string | null;
  clockOutTime?: string | null;
  hourReportID?: number | null;
}

export const createInitialHourReport = (employeeId: number, date: Date): HourReportModal => ({
  id: 0,
  date: date,
  clockInTime: undefined,
  clockOutTime: undefined,
  notes: "",
  total: undefined,
  projectID: 0,
  contractID: 0,
  subContractID: 0,
  stepID: 0,
  hourReportMethodID: 0,
  employeeId: employeeId,
});

// Helper functions
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Normalize time format to HH:MM (for HTML time input)
export const normalizeTimeFormat = (time: string | undefined): string | undefined => {
  if (!time) return undefined;
  const parts = time.split(':');
  if (parts.length !== 2) return time;
  const hours = parts[0].padStart(2, '0');
  const minutes = parts[1].padStart(2, '0');
  return `${hours}:${minutes}`;
};

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

export const addTime = (startTime: string, duration: string): string => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [durationHours, durationMinutes] = duration.split(':').map(Number);

  let totalMinutes = startMinutes + durationMinutes;
  let totalHours = startHours + durationHours;

  if (totalMinutes >= 60) {
    totalMinutes -= 60;
    totalHours += 1;
  }

  totalHours = totalHours % 24;

  return `${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}`;
};

export const getTotalTime = (reports: HourReport[]): string => {
  let totalMinutes = 0;

  for (const report of reports) {
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
