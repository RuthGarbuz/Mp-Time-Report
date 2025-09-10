import type { TimeType } from "../enum";

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SecurityState {
  attempts: number;
  isLocked: boolean;
  lockTime: Date | null;
  showCaptcha: boolean;
}

export interface UiState {
  showPassword: boolean;
  isLoading: boolean;
  errors: { [key: string]: string }; // OR more specific: errors: Partial<Record<keyof FormData, string>>;
  message: string;
  isSuccess: boolean;
}
export interface MainAppProps {
  onLogout?: () => void;
}
export interface SelectEmployeesList {
   id?: number;
  name?: string;
}
export interface Employee {
   id?: string;
  name?: string;
  jobScope?: number;
  expiresAt?: string;
  pictureBase64?: string;
  isActive?: boolean;
  startTime?: string;
  endTime?: string;
  minutesHoursAmount?: string;
  totalSecondsReported?: number;
  profileImage: string;
  timeHourReportsTypes?: TimeHourReportsType[];
  [key: string]: any;

}
export interface TimeRecord  {
  id?: number;
  date: Date;
  type: TimeType;
  typeID: number;
  clockInTime?: string;
  clockOutTime?: string;
  notes: string;
  total?: string;
};
export interface HourReport  {
  id: number;
  clockInTime?: string;
  clockOutTime?: string;
  total?: string;
  projectName: string;
};
export interface SubContract{
 id: number;
 name: string;
 contractID:number;
}
export interface HourReportStepsModal{
  contractsList:Contract[];
  subContractsList:SubContract[];  
  stepsList:Step[];
}
export interface Contract{
 id: number;
 name: string;
}
export interface Step{
 id: number;
 name: string;
 subContractID:number;
}
export interface HourReportModal{
  id: number;
  name: string;
  date: Date;
  clockInTime?: string;
  clockOutTime?: string;
  notes: string;
  total?: string;
  projectID?: number;
  contractID?: number;
  subContractID?: number;
  stepID?: number;
  hourReportMethodID:number;
  employeeId:number;
  // contractsList:Contract[];
  // subContractsList:SubContract[];
  // stepsList:Step[];
}
export interface PhoneBook  {
  id?: number;
  selectedCompanyId: number;
  company: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  companyPhone?: string;
  companyAddress?: string;
};
export interface Company {
  id: number;
  name: string;
  address: string;
  phoneNum: string;
  cityID?: number; // Assuming address is a string that includes city
}
export interface City {
  id: number;
  name: string;
}
export interface PhoneBookCompany {
  phoneBooks: PhoneBook[];
  companies: Company[];
  cities: City[]; 
}
// export interface PhoneBook {
//   id: number;
//   name: string;
//   contact: string;
//   officeEmail: string;
//   phoneNum: string;
//   // contactPhoneNum?: string; 
//   contactCell: string;
//   addressName: string;
// }

export type TimeHourReportsType = {
  id: number;
  name: string;
};
//  export interface TimeRecordEmployee  {
//   id?: string;
//   name?: string;
//   jobScope?: number;
//   expiresAt?: string;
//   [key: string]: any;
// };
export interface Task {
  taskID: number;
  subject: string;
  description: string;
  isCompleted: boolean;
  isClosed: boolean;
  priorityID:number;// 'low' | 'medium' | 'high'; // or just string if not fixed options
  // 'low' | 'medium' | 'high'; // or just string if not fixed options
  startDate: string;  // ISO date format like "2025-08-24"
  startTime: string;  // "09:00"
  dueDate: string;    // "2025-08-24"
  dueTime: string;    // "17:00"
  projectID: number;
  projectName: string;
  organizerID:number;
  recipientID:number;
}
export interface Project {
id: number;
name: string;
hoursReportMethodID:number;
}
export interface Contrat {
  id: number;
  name: string;
}
export interface SubContrat {
  id: number;
  name: string;
}
export interface Step {
  id: number;
  name: string;
}
export {};