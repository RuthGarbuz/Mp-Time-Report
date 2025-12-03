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
  projectName?: string;
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
  companyCityID?:number
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
//managerService.ts

export interface ManagerAnalises {
month: number;
year: number;
lastYear: number;
}

export interface ManagerIntakeList {
projectName?: string;
projectNum?: string;
intakeDate?: string;
customerName?: string;
sum: number;
}

export interface ManagerIntake {
managerAnalises?: ManagerAnalises;
managerIntakesList?: ManagerIntakeList[];
}

export interface ManagerBillList {
id: number;
billDate?: string;
projectName?: string;
projectNum?: string;
billNum?: string;
statusName?: string;
customerName?: string;
sum: number;
payment: number;
}

export interface ManagerBill {
managetAnalises?: ManagerAnalises;
managerBillsList?: ManagerBillList[];
}

export interface ContractorPaymentList {
projectName?: string;
projectNum?: string;
intakeDate?: string;
customerName?: string;
sum: number;
}

export interface ManagerContractorPayment {
managetAnalises?: ManagerAnalises;
managerContractorPaymentList?: ContractorPaymentList[];
}

export interface ManagerDeptor {
allDebtors: number;
approvedDebtors: number;
previousYears: number;
year: number;
lastYear: number;
managerDeptorsList?: ManagerBillList[];
}
export interface Office {
id: number;
name: string;
}
export interface DataCard {
  title: string;
  icon: React.ReactNode;
  available: boolean;
  function:string;
}
export interface ManagerProposalList {
  proposalID: number;
  proposalNum?: string;
  proposalName?: string;
  proposalDate?: string;
  statusName?: string;
  customerName?: string;
  sum: number;
}


export interface ManagerProposal {
  managetAnalises?: ManagerAnalises;
  managerPropasalList?: ManagerProposalList[];
}
export interface ManagerProjectList {
  projectName?: string;
  projectNum?: string;
  projectDate?: string;
  startDate?: string;
  customerName?: string;
  sum: number;
}

export interface ManagerProject {
  managetAnalises?: ManagerAnalises;
  managerProjectList?: ManagerProjectList[];
}
export interface FinancialSummary {
  // --- חשבונות ---
  billSumMonth: number;
  billSumYear: number;
  billCountMonth: number;
  billCountYear: number;
  debtorSum: number;

  // --- תקבולים ---
  intakeSumMonth: number;
  intakeSumYear: number;
  intakeCountMonth: number;
  intakeCountYear: number;

  // --- תשלומים לקבלני משנה ---
  contractorPaymentSumMonth: number;
  contractorPaymentSumYear: number;
  contractorPaymentCountMonth: number;
  contractorPaymentCountYear: number;

  // --- הצעות מחיר ---
  proposalSumMonth: number;
  proposalSumYear: number;
  proposalCountMonth: number;
  proposalCountYear: number;
  proposalSumActive: number;

  // --- פרויקטים חדשים והגדלות ---
  subContractSumMonth: number;
  subContractSumYear: number;
  subContractCountMonth: number;
  subContractCountYear: number;
}
export interface ProjectDataAnalyses {
  count: number;
  name?: string;
}

export interface ProjectAnalyses {
  projectsCount: number;
  projectEmployeeList?: ProjectDataAnalyses[];
  projectStatusList?: ProjectDataAnalyses[];
  projectStudioList?: ProjectDataAnalyses[];
  projectTypeList?: ProjectDataAnalyses[];
}

export interface ManagerCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  managerDataCard: any;
  officeName:string;
}
export interface StatusCategory {

  title: string;

  total: number;

  projects: ProjectDataAnalyses[];

  color: string;

}
//Conversations
export interface Conversation {
 id: number;
  subject?: string;
  dueDate?: string; // ISO string from backend
  startDate?: string; // ISO string from backend
  isClosed: boolean;
}
export interface ConversationData {
  id: number;
  subject?: string;
  dueDate?: string;
  startDate?: string;
  isCompleted: boolean;
  isClosed: boolean;
  organizerID: number;
  recipientID: number;
  contactID: number;
  contactName: string;
  conversationLogTypeID: number;
  conversationLogTypeName?: string;
  projectName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCell?: string;
  source?: string;
  companyName?: string;
}
export interface ConversationsQuery {
  employeeID: number;
  database: string;
}
export interface ConversationLogType {
  id: number;
  name: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  contactTell: string;
  contactCell: string;
  companyName: string;
}
export {};