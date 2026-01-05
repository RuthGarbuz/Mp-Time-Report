import { useState, useEffect, useCallback, useMemo } from 'react';
import { createInitialFormState, type FilterState, type TaskFormState } from '../models/taskForm.state';
import { createInitialTask, type Task } from '../models/task.model';
import { deleteTask, getTasksList, saveCompletedTask } from '../../../services/TaskService';
import authService from '../../../services/authService';

// Helper function to create initial filter state
const createInitialFilterState = (): FilterState => ({
  fromDate: new Date(),
  toDate: new Date(),
  activeTab: 'received',
  searchTerm: '',
  filter: 'today',
});

// Helper function to update filter by date range
const updateFilterByDateRange = (
  filter: 'today' | 'week' | 'all'
): Pick<FilterState, 'fromDate' | 'toDate' | 'filter'> => {
  switch (filter) {
    case 'week': {
      const endOfWeek = new Date();
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      return {
        filter,
        fromDate: new Date(),
        toDate: endOfWeek,
      };
    }
    case 'today':
      return {
        filter,
        fromDate: new Date(),
        toDate: new Date(),
      };
    case 'all':
      return {
        filter,
        fromDate: null,
        toDate: null,
      };
  }
};

export const useTasks = (openModal: () => void, closeModal: () => void) => {
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [selectedTaskID, setSelectedTaskID] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userID, setUserID] = useState(0);
  
  const [taskForm, setTaskForm] = useState<TaskFormState>(
    createInitialFormState(createInitialTask(0))
  );
  
  const [filterState, setFilterState] = useState<FilterState>(
    createInitialFilterState()
  );

  // Reset task form
  const resetTaskForm = useCallback(() => {
    setTaskForm(createInitialFormState(createInitialTask(userID)));
    closeModal();
  }, [userID, closeModal]);

  // Toggle task completion
  const toggleTask = useCallback(async (taskID: number) => {
    const task = tasksList.find(t => t.taskID === taskID);
    if (!task) return;

    const success = await saveCompletedTask(
      taskID,
      !task.isCompleted,
      task.organizerID
    );

    if (success) {
      setTasksList(prev => prev.map(t =>
        t.taskID === taskID ? { ...t, isCompleted: !t.isCompleted } : t
      ));
    }
  }, [tasksList]);

  // Delete task
  const deleteTaskHandler = useCallback(async () => {
    if (selectedTaskID === null) return;

    const success = await deleteTask(selectedTaskID, "DeleteTaskAsync");
    if (success) {
      setTasksList(prev => prev.filter(task => task.taskID !== selectedTaskID));
    }

    setShowDeleteModal(false);
    setSelectedTaskID(null);
    closeModal();
  }, [selectedTaskID, closeModal]);

  // Start editing a task
  const startEdit = useCallback((taskID: number) => {
    const task = tasksList.find(t => t.taskID === taskID);
    if (task) {
      setTaskForm({
        editingId: taskID,
        isOpen: true,
        task,
      });
      openModal();
    }
  }, [tasksList, openModal]);

  // Open new task modal
  const openNewTask = useCallback(() => {
    setTaskForm({
      editingId: 0,
      isOpen: true,
      task: createInitialTask(userID),
    });
    openModal();
  }, [userID, openModal]);

  // Update date filter
  const setDateFilter = useCallback((filter: 'today' | 'week' | 'all') => {
    const updates = updateFilterByDateRange(filter);
    setFilterState(prev => ({ ...prev, ...updates }));
  }, []);

  // Update active tab
  const setActiveTab = useCallback((activeTab: 'received' | 'sent') => {
    setFilterState(prev => ({ ...prev, activeTab }));
  }, []);

  // Update search term
  const setSearchTerm = useCallback((searchTerm: string) => {
    setFilterState(prev => ({ ...prev, searchTerm }));
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    const tasks = await getTasksList(
      filterState.fromDate,
      filterState.toDate,
      filterState.activeTab
    );
    if (tasks) {
      setTasksList(tasks);
    }
  }, [filterState.fromDate, filterState.toDate, filterState.activeTab]);

  // Normalize text for search
  const normalizeText = useCallback((text: string): string => {
    return text.replace(/'/g, '').replace(/[-\s()]/g, '').toLowerCase();
  }, []);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    const searchWords = filterState.searchTerm
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => normalizeText(word));

    return tasksList.filter((task) => {
      const searchableText = normalizeText(
        [task.subject || '', task.description || ''].join(' ')
      );
      
      return searchWords.length === 0 || searchWords.every(word => 
        searchableText.includes(word)
      );
    });
  }, [tasksList, filterState.searchTerm, normalizeText]);

  // Task statistics
  const taskStats = useMemo(() => {
    const totalCount = tasksList.length;
    const completedCount = tasksList.filter(task => task.isCompleted).length;
    const pendingCount = totalCount - completedCount;
    const completionPercentage = totalCount > 0 
      ? Math.round((completedCount / totalCount) * 100) 
      : 0;

    return {
      completedCount,
      totalCount,
      pendingCount,
      completionPercentage,
    };
  }, [tasksList]);

  // Fetch tasks on filter change
  useEffect(() => {
    const fetchData = async () => {
      const tasks = await getTasksList(
        filterState.fromDate,
        filterState.toDate,
        filterState.activeTab
      );
      const user = authService.getCurrentUser();
      setUserID(user.id);
      if (tasks) {
        setTasksList(tasks);
      }
    };
    fetchData();
  }, [filterState.fromDate, filterState.toDate, filterState.activeTab]);

  // Update task form when userID changes
  useEffect(() => {
    if (userID) {
      setTaskForm(prev => ({
        ...prev,
        task: createInitialTask(userID),
      }));
    }
  }, [userID]);

  // Close modal on search term change
  useEffect(() => {
    closeModal();
  }, [filterState.searchTerm, closeModal]);

  return {
    // State
    tasksList,
    filteredTasks,
    taskForm,
    filterState,
    showDeleteModal,
    selectedTaskID,
    taskStats,

    // Actions
    toggleTask,
    deleteTaskHandler,
    startEdit,
    openNewTask,
    resetTaskForm,
    setDateFilter,
    setActiveTab,
    setSearchTerm,
    refreshData,
    setShowDeleteModal,
    setSelectedTaskID,
  };
};