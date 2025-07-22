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
export interface Contact  {
  id: number;
  company: string;
  contact: string;
  cellPhone: string;
  email: string;
  phone?: string;
  address?: string;
};
export interface PhoneBook {
  id: number;
  name: string;
  contact: string;
  officeEmail: string;
  phoneNum: string;
  // contactPhoneNum?: string; 
  contactCell: string;
  addressName: string;
}

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

export {};