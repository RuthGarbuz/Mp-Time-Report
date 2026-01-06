import { useState, useCallback, useMemo } from 'react';
import projectService from '../../../services/projectService';
import type { ContactsToInsert, IdNameDto } from '../../../interface/projectModel';

type UseProjectContactsProps = {
  projectID: number;
  initialContacts: IdNameDto[];
  availableContacts: IdNameDto[];
  onSave: (contacts: IdNameDto[]) => void;
};

export const useProjectContacts = ({
  projectID,
  initialContacts,
  availableContacts,
  onSave,
}: UseProjectContactsProps) => {
  const [contacts, setContacts] = useState<IdNameDto[]>(initialContacts);
  const [newContacts, setNewContacts] = useState<IdNameDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Normalize text for Hebrew search
  const normalizeText = useCallback((text: string): string => {
    return text.replace(/'/g, '').replace(/[-\s()]/g, '').toLowerCase();
  }, []);

  // Filtered available contacts
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const normalizedSearch = normalizeText(searchTerm);
    
    return availableContacts.filter(contact => {
      const isAlreadySelected = contacts.some(c => c.id === contact.id);
      if (isAlreadySelected) return false;

      const normalizedName = normalizeText(contact.name);
      return normalizedName.includes(normalizedSearch);
    });
  }, [searchTerm, contacts, availableContacts, normalizeText]);

  // Add contact
  const addContact = useCallback((contact: IdNameDto) => {
    setContacts(prev => [...prev, contact]);
    setNewContacts(prev => [...prev, contact]);
    setSearchTerm('');
    setShowSearch(false);
  }, []);

  // Remove contact
  const removeContact = useCallback(async (id: number) => {
    // Check if it's a new contact (not saved yet)
    const isNewContact = newContacts.some(c => c.id === id);
    
    if (isNewContact) {
      // Just remove from local state
      setContacts(prev => prev.filter(c => c.id !== id));
      setNewContacts(prev => prev.filter(c => c.id !== id));
      return;
    }

    // Remove from server
    try {
      const success = await projectService.deleteProjectContacts(id, projectID);
      if (success) {
        setContacts(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to remove contact:', error);
    }
  }, [newContacts, projectID]);

  // Save new contacts
  const saveNewContacts = useCallback(async () => {
    if (newContacts.length === 0) {
      onSave(contacts);
      return true;
    }

    setIsSaving(true);
    try {
      const lastIndex = initialContacts.length;
      const contactsToInsert: ContactsToInsert[] = newContacts.map((contact, index) => ({
        projectID: projectID,
        contactID: contact.id,
        orderNum: lastIndex + index + 1,
      }));

      const success = await projectService.inserProjectContacts(contactsToInsert);
      
      if (success) {
        onSave(contacts);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save contacts:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [newContacts, contacts, initialContacts.length, projectID, onSave]);

  // Toggle search
  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      setSearchTerm('');
    }
  }, [showSearch]);

  // Has changes
  const hasChanges = useMemo(() => {
    return newContacts.length > 0 || contacts.length !== initialContacts.length;
  }, [newContacts.length, contacts.length, initialContacts.length]);

  return {
    // State
    contacts,
    searchTerm,
    showSearch,
    filteredContacts,
    isSaving,
    hasChanges,

    // Actions
    setSearchTerm,
    toggleSearch,
    addContact,
    removeContact,
    saveNewContacts,
  };
};