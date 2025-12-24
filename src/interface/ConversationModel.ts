export interface Conversation {
  id: number;
  subject?: string;
  dueDate?: string;
  startDate?: string;
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