import type { Task } from "./TaskModel";
export interface TaskFormState {
  editingId: number;
  isOpen: boolean;
  task: Task;
};

export interface FilterState  {
  fromDate: Date | null;
  toDate: Date | null;
  activeTab: 'received' | 'sent';
  searchTerm: string;
  filter: string;
};