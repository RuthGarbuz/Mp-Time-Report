import type { ConversationData } from './conversation.model';
import type { ConversationFormErrors } from './conversationForm.state';

/**
 * מחלקה לולידציה של שיחות
 * מכילה את כל הלוגיקה של בדיקת תקינות נתונים
 */
export class ConversationValidator {
  private conversation: ConversationData;

  constructor(conversation: ConversationData) {
    this.conversation = conversation;
  }

  /**
   * ולידציה מלאה של השיחה
   * @returns אובייקט שגיאות - אם אין שגיאות, כל השדות יהיו ריקים
   */
  validate(): ConversationFormErrors {
    const errors: ConversationFormErrors = {
      subject: '',
      time: '',
      recipient: '',
      general: ''
    };

    // בדיקת נושא השיחה
    if (!this.conversation.subject || this.conversation.subject.trim() === '') {
      errors.subject = 'נדרש נושא השיחה';
    }

    // בדיקת מקבל
    if (!this.conversation.recipientID || this.conversation.recipientID === 0) {
      errors.recipient = 'נדרש מקבל השיחה';
    }

    // בדיקת תאריכים
    if (this.conversation.startDate && this.conversation.dueDate) {
      if (this.conversation.startDate > this.conversation.dueDate) {
        errors.time = 'תאריך/שעה לא תקין';
      }
    }

    return errors;
  }

  /**
   * בדיקה האם יש שגיאות ולידציה
   */
  hasErrors(errors: ConversationFormErrors): boolean {
    return !!(errors.subject || errors.time || errors.recipient || errors.general);
  }

  /**
   * בדיקה האם יש שינויים בין שיחה מקורית לנוכחית
   */
  static hasChanges(original: ConversationData, current: ConversationData): boolean {
    return (
      original.subject !== current.subject ||
      original.contactID !== current.contactID ||
      original.recipientID !== current.recipientID ||
      original.conversationLogTypeID !== current.conversationLogTypeID ||
      original.startDate !== current.startDate ||
      original.dueDate !== current.dueDate
    );
  }

  /**
   * הכנת השיחה לשמירה
   * מנקה ערכים מיותרים ומוודא שהפורמט נכון
   */
  static prepareForSubmit(conversation: ConversationData): ConversationData {
    return {
      ...conversation,
      subject: conversation.subject.trim(),
      // ניקוי שדות ריקים
      contactName: conversation.contactName?.trim() || '',
      companyName: conversation.companyName?.trim() || ''
    };
  }
}
