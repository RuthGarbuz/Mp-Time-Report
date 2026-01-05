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

export const createInitialTask = (userId: number): Task => ({
  taskID: 0,
  subject: '',
  description: '',
  isCompleted: false,
  isClosed: false,
  priorityID: 2,
  startDate: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  dueDate: new Date().toISOString().split('T')[0],
  dueTime: '10:00',
  projectID: 0,
  projectName: '',
  organizerID: userId,
  recipientID: userId
});