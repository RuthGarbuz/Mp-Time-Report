import { useState, useEffect, useCallback, useMemo } from 'react';
import { getPhoneBookCompanyList } from '../../../services/phoneBookService';
import { createInitialFilterState, type PhoneBook, type PhoneBookFilterState } from '../models';

export const usePhoneBook = (openModal: () => void, closeModal: () => void) => {
  const [contacts, setContacts] = useState<PhoneBook[]>([]);
  const [selectedContact, setSelectedContact] = useState<PhoneBook | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterState, setFilterState] = useState<PhoneBookFilterState>(
    createInitialFilterState()
  );

  // Load contacts
  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const phoneBookData = await getPhoneBookCompanyList();
      if (phoneBookData) {
        setContacts(phoneBookData.phoneBooks as PhoneBook[]);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Normalize text for search (same logic pattern as tasks search)
  const normalizeText = useCallback((text: string): string => {
    return text.replace(/'/g, "").replace(/[-\s()]/g, "").toLowerCase();
  }, []);

  // Filter contacts (same behavior pattern as tasks search, but for phone book fields)
  const filteredContacts = useMemo(() => {
    const searchWords = filterState.searchTerm
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => normalizeText(word));

    return contacts.filter((contact) => {
      // If no search term, show all contacts
      if (searchWords.length === 0) return true;

      const searchableText = normalizeText(
        [
          contact.firstName || '',
          contact.lastName || '',
          contact.company || '',
          contact.companyPhone || '',
          contact.mobile || '',
        ].join(' ')
      );
   return searchWords.length === 0 || searchWords.every(word => 
        searchableText.includes(word)
      );
      // Skip contacts with no meaningful content after normalization
      // if (!searchableText || searchableText.trim().length === 0) {
      //   return false;
      // }

      // // Check if all search words are found in the searchable text
      // return searchWords.every(word => searchableText.includes(word));
    });
  }, [contacts, filterState.searchTerm, normalizeText]);

  // Visible contacts (for infinite scroll)
  const visibleContacts = useMemo(() => {
    return filteredContacts.slice(0, filterState.visibleCount);
  }, [filteredContacts, filterState.visibleCount]);

  // Update search term
  const setSearchTerm = useCallback((searchTerm: string) => {
   // closeModal();

    setFilterState(prev => ({ 
      ...prev, 
      searchTerm, 
      visibleCount: 20 // Reset on search
    }));
  }, []);
//closeModal
  // Load more
  const loadMore = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      visibleCount: Math.min(prev.visibleCount + 20, filteredContacts.length)
    }));
  }, [filteredContacts.length]);

  // Open add modal
  const openAddModal = useCallback(() => {
    setIsAddModalOpen(true);
    openModal();
  }, [openModal]);

  // Close add modal
  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    closeModal();
  }, [closeModal]);

  // Open edit modal
  const openEditModal = useCallback((contact: PhoneBook) => {
    setSelectedContact(contact);
    openModal();
  }, [openModal]);

  // Close edit modal
  const closeEditModal = useCallback(() => {
    setSelectedContact(null);
    closeModal();
  }, [closeModal]);

  // On save
  const handleSave = useCallback(() => {
    closeEditModal();
    closeAddModal();
    loadContacts();
  }, [closeEditModal, closeAddModal, loadContacts]);

  // Has more to load
  const hasMore = useMemo(() => {
    return filterState.visibleCount < filteredContacts.length;
  }, [filterState.visibleCount, filteredContacts.length]);

  // Load on mount
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  return {
    // State
    contacts: visibleContacts,
    filteredCount: filteredContacts.length,
    selectedContact,
    isAddModalOpen,
    isLoading,
    filterState,
    hasMore,

    // Actions
    setSearchTerm,
    loadMore,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
    handleSave,
  };
};
