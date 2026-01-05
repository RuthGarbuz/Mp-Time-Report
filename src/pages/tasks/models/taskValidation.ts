import type { Task } from './task.model';

export type ValidationErrors = {
  subject: string;
  time: string;
  recipient: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationErrors;
};

export class TaskValidator {
  static validate(task: Task): ValidationResult {
    const errors: ValidationErrors = {
      subject: '',
      time: '',
      recipient: '',
    };

    let isValid = true;

    // Validate subject
    if (!task.subject || !task.subject.trim()) {
      errors.subject = 'נדרש נושא המשימה';
      isValid = false;
    }

    // Validate recipient
    if (!task.recipientID) {
      errors.recipient = 'נדרש מקבל המשימה';
      isValid = false;
    }

    // Validate time
    if (!this.isValidDateTime(task)) {
      errors.time = 'תאריך/שעה לא תקין';
      isValid = false;
    }

    return { isValid, errors };
  }

  static isValidDateTime(task: Task): boolean {
    const startDateTime = new Date(`${task.startDate}T${task.startTime}`);
    const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
    
    return dueDateTime >= startDateTime;
  }

  static hasChanges(original: Task, current: Task): boolean {
    return JSON.stringify(original) !== JSON.stringify(current);
  }

  static adjustEndTime(startTime: string, currentEndTime: string): string {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = currentEndTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes >= endMinutes) {
      const newEndMinutes = (startMinutes + 60) % (24 * 60);
      const newEndH = String(Math.floor(newEndMinutes / 60)).padStart(2, '0');
      const newEndM = String(newEndMinutes % 60).padStart(2, '0');
      return `${newEndH}:${newEndM}`;
    }

    return currentEndTime;
  }
}