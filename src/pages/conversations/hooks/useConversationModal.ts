import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ConversationData, Contact, ConversationLogType, ConversationFormErrors } from '../models';
import type { SelectEmployeesList } from '../../../interface/MaimModel';
import { ConversationValidator, createInitialFormState } from '../models';
import employeeService from '../../../services/employeeService';
import {
  GetContactsAsync,
  GetConversationLogTypes,
  insertConverstion,
  updateConverstion
} from '../../../services/TaskService';

type UseConversationModalProps = {
  conversation: ConversationData;
  setConversation: React.Dispatch<React.SetStateAction<ConversationData>>;
  onSave: () => void;
  onClose: () => void;
  userID: number;
};

/**
 * Hook לניהול מודאל שיחה (יצירה/עריכה)
 * מרכז את כל הלוגיקה העסקית של הטופס
 */
export const useConversationModal = ({
  conversation,
  setConversation,
  onSave,
  onClose,
  userID
}: UseConversationModalProps) => {
  // =============== STATE ===============
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ConversationFormErrors>(createInitialFormState());

  // Data states
  const [employeesList, setEmployeesList] = useState<SelectEmployeesList[]>([]);
  const [logTypes, setLogTypes] = useState<ConversationLogType[]>([]);
  const [contactsList, setContactsList] = useState<Contact[]>([]);

  // UI states
  const [isOpenType, setIsOpenType] = useState(false);
  const [isOpenContactList, setIsOpenContactList] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<SelectEmployeesList | null>(null);

  // =============== COMPUTED VALUES ===============
  /**
   * כותרת המודאל - משתנה לפי מצב (יצירה/עריכה/צפייה)
   */
  const title = useMemo(() => {
    if (isReadOnly) return "פרטי שיחת לקוח";
    if (isNew) return "הוספת שיחה חדשה";
    return "עריכת שיחה";
  }, [isReadOnly, isNew]);

  /**
   * מחלקות CSS לשדות קלט - משתנות לפי מצב קריאה בלבד
   */
  const inputClass = useMemo(() => 
    `text-gray-800 w-full px-3 py-2 ${
      isReadOnly 
        ? "bg-gray-50" 
        : "border border-gray-300"
    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none`,
    [isReadOnly]
  );

  // =============== EFFECTS ===============
  /**
   * טעינת נתוני עובדים וסוגי שיחה
   * רץ פעם אחת כשיש conversation
   */
  useEffect(() => {
    const init = async () => {
      try {
        // טעינת רשימת עובדים
        const employees = await employeeService.getEmployeesList();
        if (employees) {
          setEmployeesList(employees);
        }

        // טעינת סוגי שיחה (מקאש או מהשרת)
        const cachedLogTypes = localStorage.getItem('conversationLogTypes');
        if (cachedLogTypes) {
          setLogTypes(JSON.parse(cachedLogTypes));
        } else {
          const types = await GetConversationLogTypes();
          if (types) {
            setLogTypes(types);
            localStorage.setItem('conversationLogTypes', JSON.stringify(types));
          }
        }
      } catch (err) {
        console.error("Error initializing modal:", err);
      }
    };

    if (conversation) {
      init();
    }
  }, [conversation]);

  /**
   * הגדרת העובד הנבחר כשרשימת העובדים משתנה
   */
  useEffect(() => {
    if (employeesList.length === 0) return;

    const employee = conversation.recipientID 
      ? employeesList.find(e => e.id === conversation.recipientID)
      : employeesList.find(e => e.id === userID);

    setSelectedEmployee(employee || null);
  }, [employeesList, conversation.recipientID, userID]);

  // =============== ACTIONS ===============
  /**
   * איפוס שגיאות
   */
  const resetErrors = useCallback(() => {
    setErrors(createInitialFormState());
  }, []);

  /**
   * עדכון שדה בשיחה
   */
  const updateField = useCallback((field: keyof ConversationData, value: any) => {
    setConversation(prev => ({ ...prev, [field]: value }));
    
    // ניקוי שגיאה רלוונטית
    if (field === 'subject') {
      setErrors(prev => ({ ...prev, subject: '' }));
    } else if (field === 'recipientID') {
      setErrors(prev => ({ ...prev, recipient: '' }));
    } else if (field === 'startDate' || field === 'dueDate') {
      setErrors(prev => ({ ...prev, time: '' }));
    }
  }, [setConversation]);

  /**
   * מעבר למצב עריכה/יצירה חדשה
   */
  const handleEditOrAdd = useCallback((id: number) => {
    if (id === 0) {
      // יצירה חדשה
      setConversation(prev => ({
        ...prev,
        subject: "",
        organizerID: userID,
        recipientID: 0,
      }));
      setIsNew(true);
    } else {
      // עריכה
      setIsNew(false);
    }
    setIsReadOnly(false);
  }, [setConversation, userID]);

  /**
   * ביטול עריכה - חזרה למצב קריאה בלבד
   */
  const handleCancel = useCallback(() => {
    resetErrors();
    setIsReadOnly(true);
    onClose();
  }, [resetErrors, onClose]);

  /**
   * שמירת שיחה (יצירה או עדכון)
   */
  const handleSave = useCallback(async () => {
    resetErrors();

    // ולידציה
    const validator = new ConversationValidator(conversation);
    const validationErrors = validator.validate();

    if (validator.hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return false;
    }

    setIsSaving(true);
    try {
      // הכנה לשמירה
      const preparedConversation = {
        ...ConversationValidator.prepareForSubmit(conversation),
        contactName: conversation.contactName || ''
      };

      // שמירה לשרת
      let success = false;
      if (!isNew && conversation.id) {
        success = await updateConverstion(preparedConversation);
      } else {
        const taskId = await insertConverstion(preparedConversation);
        success = taskId > 0;
      }

      if (success) {
        setIsReadOnly(true);
        onSave();
        return true;
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'שגיאה בשמירת השיחה'
        }));
        return false;
      }
    } catch (error) {
      console.error('Failed to save conversation:', error);
      setErrors(prev => ({
        ...prev,
        general: 'שגיאה בשמירת השיחה'
      }));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [conversation, isNew, resetErrors, onSave]);

  /**
   * פתיחת מודאל בחירת אנשי קשר
   */
  const openContactList = useCallback(async () => {
    const contacts = await GetContactsAsync();
    if (contacts) {
      setContactsList(contacts as Contact[]);
    }
    setIsOpenContactList(true);
  }, []);

  /**
   * בחירת איש קשר
   */
  const handleSelectContact = useCallback((contact: Contact) => {
    setConversation(prev => ({
      ...prev,
      contactID: contact.id,
      contactEmail: contact.email,
      contactPhone: contact.contactTell,
      contactCell: contact.contactCell,
      companyName: contact.companyName,
      contactName: contact.name,
    }));
    setIsOpenContactList(false);
  }, [setConversation]);

  /**
   * בחירת עובד (מקבל השיחה)
   */
  const handleEmployeeSelect = useCallback((emp: SelectEmployeesList) => {
    setConversation(prev => ({
      ...prev,
      recipientID: emp.id || 0,
    }));
    setSelectedEmployee(emp);
  }, [setConversation]);

  /**
   * בחירת סוג שיחה
   */
  const handleSelectType = useCallback((type: ConversationLogType) => {
    setConversation(prev => ({
      ...prev,
      conversationLogTypeID: type.id,
      conversationLogTypeName: type.name,
    }));
    setIsOpenType(false);
  }, [setConversation]);

  // =============== RETURN ===============
  return {
    // State
    isReadOnly,
    isNew,
    isSaving,
    errors,
    title,
    inputClass,

    // Data
    employeesList,
    logTypes,
    contactsList,
    selectedEmployee,

    // UI states
    isOpenType,
    isOpenContactList,

    // Actions
    updateField,
    handleEditOrAdd,
    handleCancel,
    handleSave,
    openContactList,
    closeContactList: () => setIsOpenContactList(false),
    handleSelectContact,
    handleEmployeeSelect,
    handleSelectType,
    setIsOpenType,
    setIsOpenContactList,
  };
};
