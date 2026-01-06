import { useState, useEffect, useCallback, useMemo } from 'react';
import { getPhoneBookCompanyList } from '../../../services/phoneBookService';
import { PhoneBookValidator } from '../models/phoneBookValidation';
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

  // Filter contacts
  const filteredContacts = useMemo(() => {
    if (!filterState.searchTerm.trim()) return contacts;
    
    return contacts.filter(contact => 
      PhoneBookValidator.matchesSearch(contact, filterState.searchTerm)
    );
  }, [contacts, filterState.searchTerm]);

  // Visible contacts (for infinite scroll)
  const visibleContacts = useMemo(() => {
    return filteredContacts.slice(0, filterState.visibleCount);
  }, [filteredContacts, filterState.visibleCount]);

  // Update search term
  const setSearchTerm = useCallback((searchTerm: string) => {
    setFilterState(prev => ({ 
      ...prev, 
      searchTerm, 
      visibleCount: 20 // Reset on search
    }));
    closeModal();
  }, [closeModal]);

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
