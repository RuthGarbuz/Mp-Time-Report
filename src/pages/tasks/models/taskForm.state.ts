import type { Task } from './task.model';

export interface TaskFormState {
  editingId: number;
  isOpen: boolean;
  task: Task;
}
export interface FilterState  {
  fromDate: Date | null;
  toDate: Date | null;
  activeTab: 'received' | 'sent';
  searchTerm: string;
  filter: string;
  visibleCount: number;
};
export const createInitialFormState = (task: Task): TaskFormState => ({
  editingId: 0,
  isOpen: false,
  task,
});