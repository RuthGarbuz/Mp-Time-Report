// Central export of all models

// Types & Interfaces
export type {
  Conversation,
  ConversationData,
  Contact,
  ConversationLogType
} from './conversation.model';

export type {
  ConversationFormState,
  ConversationFormErrors
} from './conversationForm.state';

// Helper Functions
export {
  createInitialConversation,
  normalizeSearchText,
  filterConversations
} from './conversation.model';

export {
  createInitialFormState,
  resetFormErrors
} from './conversationForm.state';

// Validator Class
export { ConversationValidator } from './conversationValidation';
