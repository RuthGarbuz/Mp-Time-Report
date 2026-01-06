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
  static validate(contact: PhoneBook, selectedCompanyId: number): PhoneBookValidationResult {
    const errors: PhoneBookValidationErrors = {
      firstName: '',
      company: '',
      email: '',
    };

    let isValid = true;

    // Validate firstName
    if (!contact.firstName || contact.firstName.trim() === '') {
      errors.firstName = 'שם פרטי הוא שדה חובה';
      isValid = false;
    }

    // Validate company
    if (!selectedCompanyId && (!contact.company || contact.company.trim() === '')) {
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
    return text.replace(/'/g, '').replace(/[-\s()]/g, '').toLowerCase();
  }

  static matchesSearch(contact: PhoneBook, searchTerm: string): boolean {
    const searchableText = this.normalizeText(
      [
        contact.firstName || '',
        contact.lastName || '',
        contact.company || '',
        contact.companyPhone || '',
        contact.mobile || ''
      ].join(' ')
    );
    
    const searchWords = searchTerm.trim().split(/\s+/).filter(word => word.length > 0);
    
    return searchWords.every(word => {
      const normalizedWord = this.normalizeText(word);
      return searchableText.includes(normalizedWord);
    });
  }
}
