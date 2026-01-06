import { useState, useCallback, useMemo } from 'react';
import type { Contact } from '../models';

type UseContactGridProps = {
  contacts: Contact[];
  onSelect: (contact: Contact | Contact[]) => Promise<void> | void;
  onClose: () => void;
  isMulti?: boolean;
};

/**
 * Hook לניהול רשת אנשי הקשר
 * מטפל בחיפוש, בחירה ואישור של אנשי קשר
 */
export const useContactGrid = ({
  contacts,
  onSelect,
  onClose,
  isMulti = false
}: UseContactGridProps) => {
  // =============== STATE ===============
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  // =============== COMPUTED VALUES ===============
  /**
   * סינון אנשי קשר לפי שאילתת החיפוש
   * מחפש בשם ובשם החברה
   */
  const filteredContacts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return contacts;

    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(query) ||
      contact.companyName.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  /**
   * בדיקה האם איש קשר נבחר
   */
  const isContactSelected = useCallback((contact: Contact): boolean => {
    if (isMulti) {
      return selectedContacts.some(c => c.id === contact.id);
    }
    return selectedContact?.id === contact.id;
  }, [isMulti, selectedContact, selectedContacts]);

  /**
   * מספר אנשי הקשר שנבחרו (למולטי)
   */
  const selectedCount = useMemo(
    () => isMulti ? selectedContacts.length : (selectedContact ? 1 : 0),
    [isMulti, selectedContacts.length, selectedContact]
  );

  // =============== ACTIONS ===============
  /**
   * טיפול בבחירה/ביטול בחירה של איש קשר
   * במצב רגיל - בחירה בודדת
   * במצב מולטי - הוספה/הסרה מהרשימה
   */
  const handleToggleContact = useCallback((contact: Contact) => {
    if (isMulti) {
      setSelectedContacts(prev => {
        const exists = prev.find(c => c.id === contact.id);
        if (exists) {
          // הסרה מהרשימה
          return prev.filter(c => c.id !== contact.id);
        }
        // הוספה לרשימה
        return [...prev, contact];
      });
    } else {
      // בחירה בודדת
      setSelectedContact(contact);
    }
  }, [isMulti]);

  /**
   * אישור הבחירה ושליחה להורה
   * במצב רגיל - שולח איש קשר אחד
   * במצב מולטי - שולח מערך
   */
  const handleConfirm = useCallback(async () => {
    if (isMulti) {
      if (selectedContacts.length > 0) {
        await onSelect(selectedContacts);
      }
    } else {
      if (selectedContact) {
        await onSelect(selectedContact);
      }
    }
  }, [isMulti, selectedContact, selectedContacts, onSelect]);

  /**
   * בדיקה האם כפתור האישור מופעל
   */
  const isConfirmDisabled = useMemo(() => {
    return isMulti ? selectedContacts.length === 0 : !selectedContact;
  }, [isMulti, selectedContacts.length, selectedContact]);

  // =============== RETURN ===============
  return {
    // State
    searchQuery,
    filteredContacts,
    selectedContact,
    selectedContacts,
    selectedCount,
    isConfirmDisabled,

    // Actions
    setSearchQuery,
    handleToggleContact,
    handleConfirm,
    isContactSelected,
    onClose,
  };
};
