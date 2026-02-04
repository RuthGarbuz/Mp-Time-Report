import type { PhoneBook } from './phoneBook.model';

export type PhoneBookValidationErrors = {
  firstName: string;
  company: string;
  email: string;
};

export type PhoneBookValidationResult = {
  isValid: boolean;
  errors: PhoneBookValidationErrors;
};

export class PhoneBookValidator {
  static validate(contact: PhoneBook, _selectedCompanyId: number, mode: 'add' | 'update'): PhoneBookValidationResult {
    const errors: PhoneBookValidationErrors = {
      firstName: '',
      company: '',
      email: '',
    };

    let isValid = true;

    // Validate firstName
    if ((contact.id!=0||mode==='add') && (!contact.firstName || contact.firstName.trim() === '')) {
      errors.firstName = 'שם פרטי הוא שדה חובה';
      isValid = false;
    }

    // Validate company
    if ( (!contact.company || contact.company.trim() === '')) {
      errors.company = 'שם חברה הוא שדה חובה';
      isValid = false;
    }

    // Validate email
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      errors.email = 'כתובת אימייל לא תקינה';
      isValid = false;
    }

    return { isValid, errors };
  }

  static normalizeText(text: string): string {
    // Remove common punctuation, separators, and whitespace so search works well
    // even when tags/values contain them (e.g. \"name | company\")
    return text
      .replace(/['",.\|]/g, '')     // quotes, commas, dots, pipes
      .replace(/[-\s()]/g, '')      // dashes, spaces, parentheses
      .toLowerCase();
  }
}
