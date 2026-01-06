import type { Project } from './project.model';

export interface ProjectFormState {
  project: Project;
  isOpen: boolean;
  editingId: number;
  selectedContacts: number[];
  errors: {
    name: string;
    clientName: string;
    dates: string;
  };
}

export const createInitialFormState = (project: Project): ProjectFormState => ({
  project,
  isOpen: false,
  editingId: 0,
  selectedContacts: [],
  errors: {
    name: '',
    clientName: '',
    dates: '',
  },
});

export const resetFormErrors = (state: ProjectFormState): ProjectFormState => ({
  ...state,
  errors: {
    name: '',
    clientName: '',
    dates: '',
  },
});