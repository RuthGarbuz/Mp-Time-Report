export interface ProjectModel {
  projectID: number;
  projectName: string;
  projectNum: string;
  name: string;
  startDate: string;     
  customerName: string;
  isActive: boolean;
}
export interface GetProjectsRequest {
  database: string;
  isActive?: boolean | null;
}
export interface ProjectDetails {
  projectID: number;
  name: string | null;
  projectNum: string | null;

  startDate: string | null; // ISO date
  endDate: string | null;

  isActive: boolean;
  description: string | null;

  officeID: number | null;
  officeName: string | null;

  cityID: number | null;
  cityName: string | null;

  statusID: number | null;
  statusName: string | null;

  copyingInstituteID: number | null;
  copyingInstituteName: string | null;

  studioDepartmentTypeID: number | null;
  studioDepartmentTypeName: string | null;

  address: string | null;

  customerID: number | null;
  customerName: string | null;

  employeeID: number | null;
  employeeName: string | null;

  projectTypeID: number | null;
  projectTypeName: string | null;
  projectDataListsDto: ProjectDataListsDto;
  projectContacts: IdNameDto[];
}
export interface IdNameDto {
  id: number;
  name: string;
}
export interface CustomerDto {
  customerID: number;
  name: string;
  isCustomer: boolean;
}
export interface ContactsToInsert {
  projectID: number;
  contactID: number;
  orderNum: number;
}
export interface ProjectDataListsDto {
  cities: IdNameDto[];
  employees: IdNameDto[];
  studios: IdNameDto[];
  offices: IdNameDto[];
  statuses: IdNameDto[];
  projectTypes: IdNameDto[];
  customers: CustomerDto[];
  copyingInstitutes: IdNameDto[];
}
export interface InsertProjectRequest {
  projectID: number;
  projectNum: string;
  name?: string;

  officeID: number;
  cityID?: number;

  statusID: number;
  hoursReportMethodID: number;

  customerID?: number;
  copyingInstituteID?: number;

  projectTypeID?: number;
  isActive: boolean;

  startDate: string;   // ISO string
  endDate: string|null;

  description?: string;
  studioDepartmentTypeID: number;

  blockHourReports: boolean;
  hourReportTypes: number;
  employeeID: number;

  address: string;
}