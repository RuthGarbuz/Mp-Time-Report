import type { ConversationData } from './conversation.model';

/**
 * Conversation form state
 */
export interface ConversationFormState {
  conversation: ConversationData;
  isOpen: boolean;
  isNew: boolean;
  isReadOnly: boolean;
  errors: ConversationFormErrors;
}

/**
 * Form validation errors
 */
export interface ConversationFormErrors {
  subject: string;
  time: string;
  recipient: string;
  general: string;
}

/**
 * Create initial form state
 */
export const createInitialFormState = (): ConversationFormErrors => ({
  subject: '',
  time: '',
  recipient: '',
  general: ''
});

/**
 * Reset form errors
 */
export const resetFormErrors = (errors: ConversationFormErrors): ConversationFormErrors => ({
  ...errors,
  subject: '',
  time: '',
  recipient: '',
  general: ''
});
