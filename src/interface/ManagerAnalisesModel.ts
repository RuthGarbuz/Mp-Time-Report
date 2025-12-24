import type { ReactNode } from "react";

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
  billSumMonth: number;
  billSumYear: number;
  billCountMonth: number;
  billCountYear: number;
  debtorSum: number;
  intakeSumMonth: number;
  intakeSumYear: number;
  intakeCountMonth: number;
  intakeCountYear: number;
  contractorPaymentSumMonth: number;
  contractorPaymentSumYear: number;
  contractorPaymentCountMonth: number;
  contractorPaymentCountYear: number;
  proposalSumMonth: number;
  proposalSumYear: number;
  proposalCountMonth: number;
  proposalCountYear: number;
  proposalSumActive: number;
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
  officeName: string;
}

export interface StatusCategory {
  title: string;
  total: number;
  projects: ProjectDataAnalyses[];
  color: string;
}

export interface DataCard {
  title: string;
  icon: ReactNode;
  available: boolean;
  function: string;
}