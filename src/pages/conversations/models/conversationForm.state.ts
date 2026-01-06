import type { ConversationData } from './conversation.model';

/**
 * מצב טופס השיחה
 */
export interface ConversationFormState {
  conversation: ConversationData;
  isOpen: boolean;
  isNew: boolean;
  isReadOnly: boolean;
  errors: ConversationFormErrors;
}

/**
 * שגיאות ולידציה בטופס
 */
export interface ConversationFormErrors {
  subject: string;
  time: string;
  recipient: string;
  general: string;
}

/**
 * יצירת מצב טופס ראשוני
 */
export const createInitialFormState = (): ConversationFormErrors => ({
  subject: '',
  time: '',
  recipient: '',
  general: ''
});

/**
 * איפוס שגיאות הטופס
 */
export const resetFormErrors = (errors: ConversationFormErrors): ConversationFormErrors => ({
  ...errors,
  subject: '',
  time: '',
  recipient: '',
  general: ''
});
