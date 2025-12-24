import type { TimeType } from "../enum";

export interface TimeRecord {
  id?: number;
  date: Date;
  type: TimeType;
  typeID: number;
  clockInTime?: string;
  clockOutTime?: string;
  notes: string;
  total?: string;
}

export interface CheckHoursOverlapQuery {
  projectID: number;
  employeeID: number;
  date: Date;
  clockInTime?: string | null;
  clockOutTime?: string | null;
  hourReportID?: number | null;
}

export interface HourReport {
  id: number;
  clockInTime?: string;
  clockOutTime?: string;
  total?: string;
  projectName: string;
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