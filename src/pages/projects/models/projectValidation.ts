import type { ProjectDetails } from './project.model';

export type ProjectValidationErrors = {
  name: string;
  projectNum: string;
  general: string;
};

export type ProjectValidationResult = {
  isValid: boolean;
  errors: ProjectValidationErrors;
};

export class ProjectValidator {
  static validate(project: ProjectDetails): ProjectValidationResult {
    const errors: ProjectValidationErrors = {
      name: '',
      projectNum: '',
      general: '',
    };

    let isValid = true;

    // Validate name
    if (!project.name || !project.name.trim()) {
      errors.name = 'שם הפרויקט הוא שדה חובה';
      isValid = false;
    }

    // Validate project number
    if (!project.projectNum || String(project.projectNum).trim() === '') {
      errors.projectNum = 'מספר הפרויקט הוא שדה חובה';
      isValid = false;
    }

    return { isValid, errors };
  }

  static hasChanges(original: ProjectDetails, current: ProjectDetails): boolean {
    const { projectContacts: _, ...originalWithoutContacts } = original;
    const { projectContacts: __, ...currentWithoutContacts } = current;
    
    return JSON.stringify(originalWithoutContacts) !== JSON.stringify(currentWithoutContacts);
  }

  static normalizeText(text: string): string {
    return text.replace(/'/g, '').replace(/[-\s()]/g, '').toLowerCase();
  }

  static matchesSearch(project: any, searchTerm: string): boolean {
    const searchableText = this.normalizeText(
      [
        project.projectName || '',
        project.projectNum || '',
        project.customerName || '',
        project.name || ''
      ].join(' ')
    );
    
    const searchWords = searchTerm.trim().split(/\s+/).filter(word => word.length > 0);
    
    return searchWords.length === 0 || searchWords.every(word => {
      const normalizedWord = this.normalizeText(word);
      return searchableText.includes(normalizedWord);
    });
  }
}