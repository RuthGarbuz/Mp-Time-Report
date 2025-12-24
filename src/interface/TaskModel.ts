export interface Task {
  taskID: number;
  subject: string;
  description: string;
  isCompleted: boolean;
  isClosed: boolean;
  priorityID: number;
  startDate: string;
  startTime: string;
  dueDate: string;
  dueTime: string;
  projectID: number;
  projectName: string;
  organizerID: number;
  recipientID: number;
}