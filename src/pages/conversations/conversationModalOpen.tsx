/**
 * ConversationModalOpen Component - Refactored Version
 * 
 * This is a modal component for adding/editing/viewing conversations with clients.
 * The new implementation uses a custom hook (useConversationModal) to separate business logic from UI,
 * and integrates with useModal for scroll locking.
 * 
 * Key features:
 * - Modes: read-only / edit / new
 * - Contact selection (via ContactsGrid)
 * - Conversation type selection (ConversationLogType)
 * - Recipient selection (AutoComplete for employees)
 * - Validation of required fields and dates
 * - Integration with useModal context for scroll locking
 * 
 * @props isOpen - Whether the modal is open
 * @props conversationData - Current conversation data
 * @props setConversationData - Function to update conversation data
 * @props resetConversation - Function to reset the modal
 * @props saveConversation - Function to save the conversation and refresh the list
 * @props userID - Logged-in user ID
 */

import React, { useEffect } from "react";
import { X, ChevronDownIcon, Edit3, Plus, Save } from "lucide-react";
import Bars3Icon from "@heroicons/react/24/solid/esm/Bars3Icon";
import ContactsGrid from "./contactGrid";
import AutoComplete from "../shared/autoCompleteInput";
import { useConversationModal } from "./hooks/useConversationModal";
import { useModal } from "../ModalContextType";
import type { ConversationData, Contact } from "./models";

type ConversationModalProps = {
  isOpen: boolean;
  newConversation: ConversationData;
  setNewConversation: React.Dispatch<React.SetStateAction<ConversationData>>;
  resetNewConversation: () => void;
  saveConversation: () => void;
  userID: number;
};

const ConversationModalOpen: React.FC<ConversationModalProps> = ({
  isOpen,
  newConversation,
  setNewConversation,
  resetNewConversation,
  saveConversation,
  userID,
}) => {
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  const { openModal, closeModal } = useModal();
  
  const {
    // State
    isReadOnly,
    isSaving,
    errors,
    title,
    inputClass,
    employeesList,
    logTypes,
    contactsList,
    isOpenContactList,
    isOpenType,
    selectedEmployee,
    
    // Actions
    handleEditOrAdd,
    handleCancel,
    handleSave,
    openContactList,
    closeContactList,
    handleSelectContact,
    handleEmployeeSelect,
    handleSelectType,
    setIsOpenType,
  } = useConversationModal({
    conversation: newConversation,
    setConversation: setNewConversation,
    onSave: saveConversation,
    onClose: resetNewConversation,
    userID
  });

  // ============================================================================
  // EFFECTS - Scroll Locking
  // ============================================================================
  
  /**
   * Integration with useModal context:
   * Locks/unlocks page scroll when modal opens/closes
   */
  useEffect(() => {
    if (isOpen) {
      openModal();
    } else {
      closeModal();
    }
    
    // Cleanup: Release lock if component unmounts
    return () => {
      if (isOpen) {
        closeModal();
      }
    };
  }, [isOpen, openModal, closeModal]);

  // ============================================================================
  // HANDLERS - Wrappers
  // ============================================================================
  
  /**
   * Handles click on edit/add button
   */
  const handleEditOrAddClick = (id: number) => {
    handleEditOrAdd(id);
  };

  /**
   * Handles cancel click - resets errors and returns to read mode
   */
  const handleCancelClick = () => {
    handleCancel();
    resetNewConversation();
  };

  /**
   * Handles save - validates and saves
   */
  const handleSaveClick = async () => {
     closeModal();
    const success = await handleSave();
    if (success) {
      saveConversation(); // Refresh main list
    }
  };

  /**
   * Handles modal close - resets everything
   */
  const handleClose = () => {
    resetNewConversation();
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="text-gray-800 bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        
        {/* ========== HEADER  ========== */}
        <div className="relative pt-1 flex items-center justify-between mb-2 px-4" >
          {/* Left Button: Edit/Save */}
          <div className="w-8 h-8 flex items-center justify-center">
            <button
              onClick={() => {
                !isReadOnly 
                  ? handleSaveClick() 
                  : handleEditOrAddClick(newConversation.id);
              }}
              disabled={isSaving}
              className="w-8 h-8 flex items-center justify-center disabled:opacity-50"
            >
              {!isReadOnly ? (
                <Save className="w-5 h-5 text-blue-600" />
              ) : (
                <Edit3 className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>

          {/* Center Title */}
          <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-gray-800">
            {title}
          </h2>

          {/* Right Button: Close */}
          <button
            onClick={handleClose}
            className="absolute left-0 w-8 h-8 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ========== BODY ========== */}
        <div className="p-4 space-y-3 overflow-y-auto">
          
          {/* Project Name & Source (Read-only) */}
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם פרויקט
              </label>
              <input
                type="text"
                value={newConversation?.projectName || ""}
                className="w-full text-gray-800 bg-gray-50 p-3 rounded-lg text-right"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מקור
              </label>
              <input
                type="text"
                value={newConversation?.source || ""}
                className="w-full text-gray-800 bg-gray-50 p-3 rounded-lg text-right"
                disabled
              />
            </div>
          </div>

          {/* Subject (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תיאור השיחה<span className="text-red-500">*</span>
            </label>
            <textarea
              value={newConversation.subject || ""}
              onChange={(e) =>
                setNewConversation((prev: any) => ({ 
                  ...prev, 
                  subject: e.target.value 
                }))
              }
              placeholder="תיאור השיחה..."
              rows={3}
              disabled={isReadOnly}
              className={inputClass}
              dir="rtl"
            />
            {errors.subject && 
                                <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
              <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
            </div>}
          </div>

          {/* Dates: Start & Due */}
          <div>
            <div className="grid grid-cols-1 [@media(min-width:350px)]:grid-cols-2 gap-3 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תאריך הפניה
                </label>
                <input
                  type="date"
                  value={newConversation.startDate || ""}
                  onChange={(e) =>
                    setNewConversation((prev: any) => ({ 
                      ...prev, 
                      startDate: e.target.value 
                    }))
                  }
                  disabled={isReadOnly}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תאריך חזרה
                </label>
                <input
                  type="date"
                  value={newConversation.dueDate || ""}
                  onChange={(e) =>
                    setNewConversation((prev: any) => ({ 
                      ...prev, 
                      dueDate: e.target.value 
                    }))
                  }
                  disabled={isReadOnly}
                  className={inputClass}
                />
              </div>
            </div>
            {errors.time && 
              <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
              <p className="text-red-500 text-sm mt-1">{errors.time}</p>
            </div>}
          </div>

          {/* Conversation Log Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סוג שיחה
            </label>
            <div className="relative w-full">
              <input
                type="text"
                value={newConversation.conversationLogTypeName || ""}
                onChange={() => setIsOpenType(true)}
                disabled={isReadOnly}
                className={inputClass}
                readOnly
              />
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => setIsOpenType(!isOpenType)}
                className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-purple-600"
              >
                <ChevronDownIcon className="h-6 w-6" />
              </button>

              {/* Dropdown list */}
              {isOpenType && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {logTypes.map((lt: any) => (
                    <li
                      key={lt.id}
                      onClick={() => handleSelectType(lt)}
                      className="p-2 cursor-pointer hover:bg-[#0078d7] hover:text-white"
                    >
                      {lt.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Organizer (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שולח
            </label>
            <input
              type="text"
              value={
                employeesList.find((e) => e.id === newConversation.organizerID)
                  ?.name || ""
              }
              readOnly
              className="text-gray-800 w-full px-3 py-2 bg-gray-50 rounded-lg"
            />
          </div>

          {/* Recipient (Required) */}
          <div className="relative w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מקבל<span className="text-red-500">*</span>
            </label>
            <AutoComplete
              disabled={isReadOnly}
              items={employeesList}
              selectedItem={selectedEmployee}
              onSelect={handleEmployeeSelect}
              getItemId={(emp) => emp.id ?? 0}
              getItemLabel={(emp) => emp.name ?? ""}
              placeholder="בחר מקבל..."
              height={2}
            />
           
            {errors.recipient &&
              <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
              <p className="text-red-500 text-sm mt-1">{errors.recipient}</p>
           </div>}
          </div>

          {/* Contact Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              איש קשר
            </label>
            <div className="relative w-full">
              <input
                type="text"
                value={newConversation.contactName || ""}
                placeholder="בחר איש קשר..."
                readOnly
                disabled={isReadOnly}
                className={inputClass}
              />
              <button
                onClick={openContactList}
                disabled={isReadOnly}
                className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-purple-600"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>

            {/* Contact Grid Popup */}
            {isOpenContactList && (
              <ContactsGrid
                contacts={contactsList}
                onClose={closeContactList}
                handleSelectContact={(contact: Contact) => {
                  handleSelectContact(contact);
                }}
              />
            )}
          </div>

          {/* Company Info (Read-only) */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  חברה:
                </label>
                <input
                  type="text"
                  value={newConversation?.companyName || ""}
                  className="text-gray-800 w-full px-3 py-2 bg-gray-50 rounded-lg"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אימייל:
                </label>
                <input
                  type="text"
                  value={newConversation?.contactEmail || ""}
                  className="text-gray-800 w-full px-3 py-2 bg-gray-50 rounded-lg"
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מספר נייד:
                </label>
                <input
                  type="text"
                  value={newConversation?.contactCell || ""}
                  className="text-gray-800 w-full px-3 py-2 bg-gray-50 rounded-lg"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מספר טלפון:
                </label>
                <input
                  type="text"
                  value={newConversation?.contactPhone || ""}
                  className="text-gray-800 w-full px-3 py-2 bg-gray-50 rounded-lg"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex gap-3 pt-4">
            {isReadOnly ? (
              <>
                {/* Add New Button */}
                <button
                  onClick={() => handleEditOrAddClick(0)}
                  className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  הוסף חדש
                </button>
                {/* Edit Button */}
                <button
                  onClick={() => handleEditOrAddClick(newConversation.id)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  ערוך שינויים
                </button>
              </>
            ) : (
              <>
                {/* Cancel Button */}
                <button
                  onClick={handleCancelClick}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
                >
                  ביטול
                </button>
                {/* Save Button */}
                <button
                  onClick={handleSaveClick}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-600 disabled:opacity-50"
                >
                  {isSaving ? "שומר..." : "שמור"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationModalOpen;
