import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Employee } from '../../../interface/TimeHourModel';
import type { Conversation, ConversationData } from '../models';
import { createInitialConversation, filterConversations } from '../models';
import timeRecordService from '../../../services/timeRecordService';
import { 
  deleteTask, 
  saveCompletedTask, 
  getConversationList, 
  GetConversationsByID 
} from '../../../services/TaskService';

/**
 * Hook לניהול רשימת השיחות
 * מרכז את כל הלוגיקה העסקית של רשימת השיחות במקום אחד
 */
export const useConversationList = () => {
  // =============== STATE ===============
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConversationID, setSelectedConversationID] = useState<number | null>(null);
  const [conversationData, setConversationData] = useState<ConversationData>(
    createInitialConversation(0, 0)
  );

  // Refs
  const listRef = useRef<HTMLDivElement | null>(null);

  // =============== COMPUTED VALUES ===============
  /**
   * סינון שיחות לפי מונח חיפוש
   * משתמש ב-useMemo למניעת חישובים מיותרים
   */
  const filteredConversations = useMemo(
    () => filterConversations(conversations, searchTerm),
    [conversations, searchTerm]
  );

  /**
   * שיחות גלויות (virtual scrolling)
   */
  const visibleConversations = useMemo(
    () => filteredConversations.slice(0, visibleCount),
    [filteredConversations, visibleCount]
  );

  // =============== EFFECTS ===============
  /**
   * טעינת נתוני עובד
   * רץ פעם אחת בהתחלה
   */
  useEffect(() => {
    const storedEmployee = timeRecordService.getEmployee();
    if (storedEmployee) {
      setEmployee(storedEmployee);
    } else {
      setEmployee({
        name: "משתמש לא ידוע",
        profileImage: "https://via.placeholder.com/150"
      });
    }
  }, []);

  /**
   * טעינת רשימת שיחות
   * רץ פעם אחת בהתחלה
   */
  useEffect(() => {
    loadConversations();
  }, []);

  /**
   * איפוס מספר הפריטים הגלויים כשהחיפוש משתנה
   */
  useEffect(() => {
    setVisibleCount(20);
  }, [searchTerm]);

  // =============== ACTIONS ===============
  /**
   * טעינת רשימת שיחות מהשרת
   */
  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversationList();
      setConversations(data as Conversation[] || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    }
  }, []);

  /**
   * טיפול בגלילה - virtual scrolling
   * טוען עוד פריטים כשמגיעים לסוף הרשימה
   */
  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    
    // בודק אם הגענו קרוב לסוף (50px לפני)
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setVisibleCount((prev) => Math.min(prev + 20, filteredConversations.length));
    }
  }, [filteredConversations.length]);

  /**
   * פתיחת מודאל שיחה חדשה או עריכת שיחה קיימת
   * @param id - 0 לשיחה חדשה, או מזהה השיחה לעריכה
   */
  const openConversationModal = useCallback(async (id: number) => {
    if (id === 0) {
      // שיחה חדשה - איפוס הנתונים
      const initialData = createInitialConversation(
        employee?.id ?? 0,
        employee?.id ?? 0
      );
      setConversationData(initialData);
    } else {
      // עריכת שיחה קיימת - טעינת הנתונים
      const data = await GetConversationsByID(id);
      if (data) {
        setConversationData(data as ConversationData);
      }
    }
    
    setShowAddModal(true);
  }, [employee]);

  /**
   * סגירת מודאל השיחה ואיפוס הנתונים
   */
  const closeConversationModal = useCallback(() => {
    setShowAddModal(false);
    setSelectedConversationID(null);
    const initialData = createInitialConversation(
      employee?.id ?? 0,
      employee?.id ?? 0
    );
    setConversationData(initialData);
  }, [employee]);

  /**
   * שמירת שיחה (חדשה או עדכון קיים)
   * טוען מחדש את הרשימה אחרי שמירה מוצלחת
   */
  const saveConversation = useCallback(async () => {
    await loadConversations();
    closeConversationModal();
  }, [loadConversations, closeConversationModal]);

  /**
   * סימון שיחה כסגורה/פתוחה
   * @param id - מזהה השיחה
   */
  const toggleConversationClosed = useCallback(async (id: number) => {
    const conversation = conversations.find(c => c.id === id);
    if (!conversation) return;

    const success = await saveCompletedTask(
      id,
      !conversation.isClosed,
      employee?.id ?? 0
    );

    if (success) {
      // מסיר את השיחה מהרשימה אחרי סגירה
      setConversations(prev => prev.filter(c => c.id !== id));
    }
  }, [conversations, employee]);

  /**
   * פתיחת מודאל אישור מחיקה
   */
  const openDeleteModal = useCallback((id: number) => {
    setSelectedConversationID(id);
    setShowDeleteModal(true);
  }, []);

  /**
   * ביטול מחיקה - סגירת המודאל
   */
  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setSelectedConversationID(null);
  }, []);

  /**
   * אישור מחיקת שיחה
   * מוחק מהשרת ומעדכן את הרשימה המקומית
   */
  const confirmDelete = useCallback(async () => {
    if (selectedConversationID === null) return;

    try {
      const success = await deleteTask(selectedConversationID, "DeleteConversationAsync");
      if (success) {
        setConversations(prev => prev.filter(c => c.id !== selectedConversationID));
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setShowDeleteModal(false);
      setSelectedConversationID(null);
    }
  }, [selectedConversationID]);

  // =============== RETURN ===============
  return {
    // State
    employee,
    conversations: visibleConversations,
    searchTerm,
    visibleCount,
    filteredCount: filteredConversations.length,
    showAddModal,
    showDeleteModal,
    selectedConversationID,
    conversationData,
    listRef,

    // Actions
    setSearchTerm,
    handleScroll,
    openConversationModal,
    closeConversationModal,
    saveConversation,
    setConversationData,
    toggleConversationClosed,
    openDeleteModal,
    cancelDelete,
    confirmDelete,
  };
};
