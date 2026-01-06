/**
 * ConversationModalOpen Component - Refactored Version
 * 
 * זהו רכיב מודאלי להוספה/עריכה/צפייה בשיחות עם לקוחות.
 * המימוש החדש משתמש ב-hook מותאם אישית (useConversationModal) להפרדת לוגיקה עסקית מהממשק,
 * ובאינטגרציה עם useModal ל scroll locking.
 * 
 * תכונות עיקריות:
 * - מצבים: צפייה בלבד / עריכה / הוספה חדשה
 * - בחירת איש קשר (דרך ContactsGrid)
 * - בחירת סוג שיחה (ConversationLogType)
 * - בחירת מקבל השיחה (AutoComplete עבור עובדים)
 * - וולידציה של שדות חובה ותאריכים
 * - אינטגרציה עם useModal context לנעילת scroll
 * 
 * @props isOpen - האם המודאל פתוח
 * @props conversationData - נתוני השיחה הנוכחיים
 * @props setConversationData - פונקציה לעדכון נתוני השיחה
 * @props resetConversation - פונקציה לאיפוס המודאל
 * @props saveConversation - פונקציה לשמירת השיחה ורענון הרשימה
 * @props userID - מזהה המשתמש המחובר
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
   * אינטגרציה עם useModal context:
   * נועל/משחרר את ה-scroll של הדף כאשר המודאל נפתח/נסגר
   */
  useEffect(() => {
    if (isOpen) {
      openModal();
    } else {
      closeModal();
    }
    
    // Cleanup: שחרר נעילה אם הקומפוננטה מוסרת
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
   * מטפל בלחיצה על כפתור עריכה/הוספה
   */
  const handleEditOrAddClick = (id: number) => {
    handleEditOrAdd(id);
  };

  /**
   * מטפל בלחיצה על ביטול - מאפס שגיאות ומחזיר למצב קריאה
   */
  const handleCancelClick = () => {
    handleCancel();
    resetNewConversation();
  };

  /**
   * מטפל בשמירה - מוודא תקינות ושומר
   */
  const handleSaveClick = async () => {
    const success = await handleSave();
    if (success) {
      saveConversation(); // רענן את הרשימה הראשית
    }
  };

  /**
   * מטפל בסגירת המודאל - מאפס הכל
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
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
            )}
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
            {errors.time && (
              <p className="text-red-500 text-sm mt-1">{errors.time}</p>
            )}
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
            {errors.recipient && (
              <p className="text-red-500 text-sm mt-1">{errors.recipient}</p>
            )}
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
