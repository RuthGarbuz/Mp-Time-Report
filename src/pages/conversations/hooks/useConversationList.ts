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
 * Hook for managing conversation list
 * Centralizes all business logic for conversation list in one place
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
   * Filter conversations by search term
   * Uses useMemo to prevent unnecessary calculations
   */
  const filteredConversations = useMemo(
    () => filterConversations(conversations, searchTerm),
    [conversations, searchTerm]
  );

  /**
   * Visible conversations (virtual scrolling)
   */
  const visibleConversations = useMemo(
    () => filteredConversations.slice(0, visibleCount),
    [filteredConversations, visibleCount]
  );

  // =============== EFFECTS ===============
  /**
   * Load employee data
   * Runs once on mount
   */
  useEffect(() => {
    const storedEmployee = timeRecordService.getEmployee();
    if (storedEmployee) {
      setEmployee(storedEmployee);
    } else {
      setEmployee({
        name: "Unknown User",
        profileImage: "https://via.placeholder.com/150"
      });
    }
  }, []);

  /**
   * Load conversations list
   * Runs once on mount
   */
  useEffect(() => {
    loadConversations();
  }, []);

  /**
   * Reset number of visible items when search changes
   */
  useEffect(() => {
    setVisibleCount(20);
  }, [searchTerm]);

  // =============== ACTIONS ===============
  /**
   * Load conversations list from server
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
   * Handle scroll - virtual scrolling
   * Loads more items when reaching the end of the list
   */
  const handleScroll = useCallback(() => {
    if (!listRef.current || visibleCount >= filteredConversations.length) return;
    
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    
    // Check if we're close to the end (50px before)
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadMore();
    }
  }, [visibleCount, filteredConversations.length]);

  /**
   * Load more conversations
   */
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 20, filteredConversations.length));
  }, [filteredConversations.length]);

  /**
   * Has more conversations to load
   */
  const hasMore = useMemo(() => {
    return visibleCount < filteredConversations.length;
  }, [visibleCount, filteredConversations.length]);

  /**
   * Open new conversation modal or edit existing conversation
   * @param id - 0 for new conversation, or conversation ID for editing
   */
  const openConversationModal = useCallback(async (id: number) => {
    if (id === 0) {
      // New conversation - reset data
      const initialData = createInitialConversation(
        employee?.id ?? 0,
        employee?.id ?? 0
      );
      setConversationData(initialData);
    } else {
      // Edit existing conversation - load data
      const data = await GetConversationsByID(id);
      if (data) {
        setConversationData(data as ConversationData);
      }
    }
    
    setShowAddModal(true);
  }, [employee]);

  /**
   * Close conversation modal and reset data
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
   * Save conversation (new or update existing)
   * Reloads list after successful save
   */
  const saveConversation = useCallback(async () => {
    await loadConversations();
    closeConversationModal();
  }, [loadConversations, closeConversationModal]);

  /**
   * Mark conversation as closed/open
   * @param id - Conversation ID
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
      // Remove conversation from list after closing
      setConversations(prev => prev.filter(c => c.id !== id));
    }
  }, [conversations, employee]);

  /**
   * Open delete confirmation modal
   */
  const openDeleteModal = useCallback((id: number) => {
    setSelectedConversationID(id);
    setShowDeleteModal(true);
  }, []);

  /**
   * Cancel delete - close modal
   */
  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setSelectedConversationID(null);
  }, []);

  /**
   * Confirm conversation deletion
   * Deletes from server and updates local list
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
    hasMore,

    // Actions
    setSearchTerm,
    handleScroll,
    loadMore,
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
