import type { PhoneBook } from './phoneBook.model';

export interface PhoneBookFormState {
  contact: PhoneBook;
  isOpen: boolean;
  mode: 'add' | 'update';
  isEditing: boolean;
  isAddingCompany: boolean;
  errors: {
    firstName: string;
    company: string;
    email: string;
    general: string;
  };
}

export const createInitialFormState = (contact: PhoneBook, mode: 'add' | 'update'): PhoneBookFormState => ({
  contact,
  isOpen: false,
  mode,
  isEditing: mode === 'add',
  isAddingCompany: false,
  errors: {
    firstName: '',
    company: '',
    email: '',
    general: '',
  },
});

export const resetFormErrors = (state: PhoneBookFormState): PhoneBookFormState => ({
  ...state,
  errors: {
    firstName: '',
    company: '',
    email: '',
    general: '',
  },
});
