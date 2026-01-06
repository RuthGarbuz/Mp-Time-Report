export interface Project {
  projectID: number;
  name: string;
  projectNum: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  description: string;
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
  address: string;
  customerID: number | null;
  customerName: string | null;
  employeeID: number | null;
  employeeName: string | null;
  projectTypeID: number | null;
  projectTypeName: string | null;
}

export enum ProjectStatus {
  Active = 1,
  Completed = 2,
  OnHold = 3,
  Cancelled = 4,
}

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.Active]: 'פעיל',
  [ProjectStatus.Completed]: 'הושלם',
  [ProjectStatus.OnHold]: 'בהמתנה',
  [ProjectStatus.Cancelled]: 'בוטל',
};

export const getProjectStatusLabel = (status: ProjectStatus): string => {
  return ProjectStatusLabels[status] || 'לא ידוע';
};

export interface ProjectDetails extends Project {
  projectDataListsDto: ProjectDataLists;
  projectContacts: IdNameDto[];
}

export interface ProjectDataLists {
  cities: IdNameDto[];
  employees: IdNameDto[];
  studios: IdNameDto[];
  offices: IdNameDto[];
  statuses: IdNameDto[];
  projectTypes: IdNameDto[];
  customers: CustomerDto[];
  copyingInstitutes: IdNameDto[];
}

export interface IdNameDto {
  id: number;
  name: string;
}

export interface CustomerDto extends IdNameDto {
  customerID: number;
  isCustomer: boolean;
}

export interface InsertProjectRequest {
  projectID: number;
  projectNum: string;
  name: string;
  officeID: number;
  cityID: number;
  statusID: number;
  hoursReportMethodID: number;
  customerID: number;
  copyingInstituteID: number;
  projectTypeID: number;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  description: string;
  studioDepartmentTypeID: number;
  blockHourReports: boolean;
  hourReportTypes: number;
  employeeID: number;
  address: string;
}

export const createInitialProject = (): ProjectDetails => ({
  projectID: 0,
  name: '',
  projectNum: null,
  startDate: new Date().toISOString().split('T')[0],
  endDate: null,
  isActive: true,
  description: '',
  officeID: null,
  officeName: null,
  cityID: null,
  cityName: null,
  statusID: null,
  statusName: null,
  copyingInstituteID: null,
  copyingInstituteName: null,
  studioDepartmentTypeID: null,
  studioDepartmentTypeName: null,
  address: '',
  customerID: null,
  customerName: null,
  employeeID: null,
  employeeName: null,
  projectTypeID: null,
  projectTypeName: null,
  projectDataListsDto: {
    cities: [],
    employees: [],
    studios: [],
    offices: [],
    statuses: [],
    projectTypes: [],
    customers: [],
    copyingInstitutes: []
  },
  projectContacts: []
});

export const mapProjectToInsertRequest = (project: ProjectDetails): InsertProjectRequest => ({
  projectID: project.projectID,
  projectNum: project.projectNum!,
  name: project.name!,
  officeID: project.officeID!,
  cityID: project.cityID!,
  statusID: project.statusID!,
  hoursReportMethodID: 1,
  customerID: project.customerID!,
  copyingInstituteID: project.copyingInstituteID!,
  projectTypeID: project.projectTypeID!,
  isActive: project.isActive,
  startDate: new Date(project.startDate!).toISOString(),
  endDate: project.endDate ? new Date(project.endDate).toISOString() : null,
  description: project.description!,
  studioDepartmentTypeID: project.studioDepartmentTypeID!,
  blockHourReports: false,
  hourReportTypes: 1,
  employeeID: project.employeeID!,
  address: project.address ?? ''
});