export interface TimeHourReportsType {
  id: number;
  name: string;
}

export interface Employee {
  id?: number;
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