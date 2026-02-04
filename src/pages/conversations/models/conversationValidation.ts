import type { ConversationData } from './conversation.model';
import type { ConversationFormErrors } from './conversationForm.state';

/**
 * Conversation validation class
 * Contains all data validation logic
 */
export class ConversationValidator {
  private conversation: ConversationData;

  constructor(conversation: ConversationData) {
    this.conversation = conversation;
  }

  /**
   * Full conversation validation
   * @returns Error object - if no errors, all fields will be empty
   */
  validate(): ConversationFormErrors {
    const errors: ConversationFormErrors = {
      subject: '',
      time: '',
      recipient: '',
      general: ''
    };

    // Check conversation subject
    if (!this.conversation.subject || this.conversation.subject.trim() === '') {
      errors.subject = 'נדרש נושא השיחה';
    }

    // Check recipient
    if (!this.conversation.recipientID || this.conversation.recipientID === 0) {
      errors.recipient = 'נדרש מקבל השיחה';
    }

    // Check dates
    if (this.conversation.startDate && this.conversation.dueDate) {
      if (this.conversation.startDate > this.conversation.dueDate) {
        errors.time = 'תאריך/שעה לא תקין';
      }
    }

    return errors;
  }

  /**
   * Check if there are validation errors
   */
  hasErrors(errors: ConversationFormErrors): boolean {
    return !!(errors.subject || errors.time || errors.recipient || errors.general);
  }

  /**
   * Check if there are changes between original and current conversation
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
   * Prepare conversation for submission
   * Cleans unnecessary values and ensures correct format
   */
  static prepareForSubmit(conversation: ConversationData): ConversationData {
    return {
      ...conversation,
      subject: conversation.subject.trim(),
      // Clean empty fields
      contactName: conversation.contactName?.trim() || '',
      companyName: conversation.companyName?.trim() || ''
    };
  }
}
