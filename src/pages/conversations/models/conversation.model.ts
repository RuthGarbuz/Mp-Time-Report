// Interfaces and types for the Conversations module
export interface Conversation {
  id: number;
  subject: string;
  contactID: number;
  contactName?: string;
  companyName?: string;
  startDate: string;
  dueDate: string;
  isCompleted: boolean;
  isClosed: boolean;
  organizerID: number;
  recipientID: number;
  conversationLogTypeID: number;
  projectName?: string;
}

export interface ConversationData {
  id: number;
  subject: string;
  contactID: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCell?: string;
  companyName?: string;
  dueDate: string;
  startDate: string;
  isCompleted: boolean;
  isClosed: boolean;
  organizerID: number;
  recipientID: number;
  conversationLogTypeID: number;
  conversationLogTypeName?: string;
  projectName?: string;
  source?: string;
}

export interface Contact {
  id: number;
  name: string;
  companyName: string;
  email: string;
  contactTell: string;
  contactCell: string;
}

export interface ConversationLogType {
  id: number;
  name: string;
}

/**
 * Function to create an initial conversation object
 * @param organizerID - Sender ID
 * @param recipientID - Recipient ID (default value)
 */
export const createInitialConversation = (organizerID: number, recipientID: number = 0): ConversationData => {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    id: 0,
    subject: '',
    contactID: 0,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactCell: '',
    companyName: '',
    dueDate: today,
    startDate: today,
    isCompleted: false,
    isClosed: false,
    organizerID,
    recipientID,
    conversationLogTypeID: 0,
    conversationLogTypeName: '',
    projectName: '',
    source: ''
  };
};

/**
 * Helper function to normalize text for search
 * Removes quotes, spaces, and special characters to improve search results
 */
export const normalizeSearchText = (text: string): string => {
  return text.replace(/'/g, '').replace(/[-\s()]/g, '').toLowerCase();
};

/**
 * Filter conversations by search term
 * @param conversations - List of conversations
 * @param searchTerm - Search term
 */
export const filterConversations = (conversations: Conversation[], searchTerm: string): Conversation[] => {
  if (!searchTerm.trim()) return conversations;

  const searchWords = searchTerm.trim().split(/\s+/).filter(word => word.length > 0);

  return conversations.filter((conversation) => {
    const searchableText = normalizeSearchText(conversation.subject || '');
    
    // Check that all words appear in the searchable text
    return searchWords.every(word => {
      const normalizedWord = normalizeSearchText(word);
      return searchableText.includes(normalizedWord);
    });
  });
};
