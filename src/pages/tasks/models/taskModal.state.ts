import type { Task } from './task.model';
import type { Project } from '../../../interface/projectModel';
import type { SelectEmployeesList } from '../../../interface/MaimModel';

export type TaskModalState = {
  taskDetails: Task;
  selectedProject: Project | null;
  selectedEmployee: SelectEmployeesList | null;
  errors: {
    subject: string;
    time: string;
    recipient: string;
  };
};

export type TaskModalData = {
  projects: Project[];
  employees: SelectEmployeesList[];
  isLoading: boolean;
};

export const createInitialModalState = (task: Task): TaskModalState => ({
  taskDetails: { ...task },
  selectedProject: null,
  selectedEmployee: null,
  errors: {
    subject: '',
    time: '',
    recipient: '',
  },
});

export const resetErrors = (state: TaskModalState): TaskModalState => ({
  ...state,
  errors: {
    subject: '',
    time: '',
    recipient: '',
  },
});