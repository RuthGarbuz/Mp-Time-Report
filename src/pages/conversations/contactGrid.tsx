/**
 * ContactsGrid Component - Refactored Version
 * 
 * Grid component for selecting contacts with search and filtering capabilities.
 * The new implementation uses a custom hook (useContactGrid) to separate business logic from UI,
 * and integrates with useModal for scroll locking.
 * 
 * Key features:
 * - Real-time search (name, company)
 * - Support for single or multi-select mode
 * - Display counter for selected contacts
 * - Integration with useModal context for scroll locking
 * 
 * @props contacts - List of contacts
 * @props onClose - Function to close the grid
 * @props handleSelectContact - Function to select a contact (in single-select mode)
 * @props isMultiSelect - Whether to allow multiple contact selection (default: false)
 * @props onConfirmSelection - Function to confirm multi-selection (optional)
 */

import React, { useEffect } from "react";
import { X, Search } from "lucide-react";
import { useContactGrid } from "./hooks/useContactGrid";
import { useModal } from "../ModalContextType";
import type { Contact } from "./models";

type ContactsGridProps = {
  contacts: Contact[];
  onClose: () => void;
  handleSelectContact: (contact: Contact) => void;
  isMultiSelect?: boolean;
  onConfirmSelection?: (contacts: Contact[]) => void;
};

const ContactsGrid: React.FC<ContactsGridProps> = ({
  contacts,
  onClose,
  handleSelectContact,
  isMultiSelect = false,
  onConfirmSelection,
}) => {
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  const { openModal, closeModal } = useModal();
  
  // Wrapper function for proper type handling
  const handleSelect = (contact: Contact | Contact[]) => {
    if (isMultiSelect && onConfirmSelection) {
      onConfirmSelection(Array.isArray(contact) ? contact : [contact]);
    } else if (!Array.isArray(contact)) {
      handleSelectContact(contact);
    }
  };
  
  const {
    // State
    searchQuery,
    selectedContacts,
    
    // Computed
    filteredContacts,
    selectedCount,
    isConfirmDisabled,
    
    // Actions
    setSearchQuery,
    handleToggleContact,
    handleConfirm,
    isContactSelected,
  } = useContactGrid({
    contacts,
    onSelect: handleSelect,
    onClose,
    isMulti: isMultiSelect
  });

  // ============================================================================
  // EFFECTS - Scroll Locking
  // ============================================================================
  
  /**
   * Integration with useModal context:
   * Locks page scroll when the grid is opened
   */
  useEffect(() => {
    openModal();
    
    // Cleanup: Release lock when component unmounts
    return () => {
      closeModal();
    };
  }, [openModal, closeModal]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  /**
   * Handles contact click:
   * - In single-select mode: closes the grid and returns the contact
   * - In multi-select mode: adds/removes from the list
   */
  const onContactClick = (contact: Contact) => {
    if (!isMultiSelect) {
      // Single select mode: close immediately
      handleSelectContact(contact);
      onClose();
    } else {
      // Multi-select mode: toggle selection
      handleToggleContact(contact);
    }
  };

  /**
   * Handles multi-selection confirmation
   */
  const onConfirm = () => {
     handleConfirm();
    if (onConfirmSelection) {
      onConfirmSelection(selectedContacts); 
    }
    onClose();
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        
        {/* ========== HEADER ========== */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">
              בחירת אנשי קשר
            </h2>
            {/* Counter for multi-selection */}
            {isMultiSelect && selectedCount > 0 && (
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {selectedCount} נבחרו
              </span>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ========== SEARCH BAR ========== */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש לפי שם או חברה..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="rtl"
            />
          </div>
        </div>

        {/* ========== CONTACTS GRID ========== */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredContacts.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Search className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">לא נמצאו אנשי קשר</p>
              <p className="text-sm">נסה לשנות את מילת החיפוש</p>
            </div>
          ) : (
            // Contacts grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => {
                const isSelected = isContactSelected(contact);
                
                return (
                  <div
                    key={contact.id}
                    onClick={() => onContactClick(contact)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }
                    `}
                  >
                    {/* Checkbox (Multi-select only) */}
                    {isMultiSelect && (
                      <div className="flex items-center justify-end mb-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Handled by parent div onClick
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    )}
                    
                    {/* Contact Name */}
                    <div className="text-lg font-bold text-gray-800 mb-2 text-right">
                      {contact.name}
                    </div>
                    
                    {/* Company Name */}
                    <div className="text-sm text-gray-600 mb-3 text-right">
                      {contact.companyName}
                    </div>
                    
                    {/* Contact Details */}
                    <div className="space-y-1 text-sm text-gray-500 text-right">
                      {contact.email && (
                        <div className="flex items-center justify-end gap-2">
                          <span className="truncate">{contact.email}</span>
                          <span>📧</span>
                        </div>
                      )}
                      {contact.contactCell && (
                        <div className="flex items-center justify-end gap-2">
                          <span dir="ltr">{contact.contactCell}</span>
                          <span>📱</span>
                        </div>
                      )}
                      {contact.contactTell && (
                        <div className="flex items-center justify-end gap-2">
                          <span dir="ltr">{contact.contactTell}</span>
                          <span>📞</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========== FOOTER (Multi-select only) ========== */}
        {isMultiSelect && (
          <div className="p-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={onConfirm}
              disabled={isConfirmDisabled}
              className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              אשר בחירה ({selectedCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsGrid;
