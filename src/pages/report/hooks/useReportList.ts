/**
 * useReportList Hook
 * 
 * This custom hook manages the state and logic for the report list component.
 * It handles:
 * - Loading and filtering reports
 * - Week navigation
 * - Report CRUD operations
 * - Permission checks
 * - Statistics calculations
 */

import { useState, useEffect } from 'react';
import type { TimeRecord, Employee, TimeHourReportsType } from '../models';
import {
  getTotalTime,
  getReportedDaysCount,
  createInitialReport,
  TimeRecordValidator
} from '../models';
import authService from '../../../services/authService';
import timeRecordService from '../../../services/timeRecordService';

/**
 * Hook return type
 */
interface UseReportListReturn {
  // State
  employee: Employee | null;
  reports: TimeRecord[];
  filteredReports: TimeRecord[] | null;
  typeReports: TimeHourReportsType[];
  currentWeek: Date;
  totalTime: string | undefined;
  totalDay: number | undefined;
  editPermission: boolean;
  allowAddReport: boolean;
  
  // Modal state
  isModalOpen: boolean;
  newReport: TimeRecord;
  editingReportId: number | null;
  errorMessage: string[] | null;
  
  // Confirm delete state
  isConfirmOpen: boolean;
  itemToDelete: number | null;
  contextMenuRowId: number | null;
  
  // Actions
  navigateWeek: (direction: 'prev' | 'next' | 'today') => void;
  openNewReport: () => void;
  openEditReport: (id: number) => void;
  closeReportModal: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  setNewReport: React.Dispatch<React.SetStateAction<TimeRecord>>;
  onDeleteClick: (id: number) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
  setContextMenuRowId: React.Dispatch<React.SetStateAction<number | null>>;
  getReportTypeStyle: (type: number) => string;
}

/**
 * Main hook for report list management
 */
export const useReportList = (): UseReportListReturn => {
  // Employee state
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [editPermission, setEditPermission] = useState(false);
  const [allowAddReport, setAllowAddReport] = useState(false);
  
  // Reports state
  const [reports, setReports] = useState<TimeRecord[]>([]);
  const [filteredReports, setFilteredReports] = useState<TimeRecord[] | null>(null);
  const [typeReports, setTypeReports] = useState<TimeHourReportsType[]>([]);
  
  // Statistics
  const [totalTime, setTotalTime] = useState<string>();
  const [totalDay, setTotalDay] = useState<number>();
  
  // Week navigation
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReport, setNewReport] = useState<TimeRecord>(
    createInitialReport(new Date())
  );
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string[] | null>(null);
  
  // Delete confirmation state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [contextMenuRowId, setContextMenuRowId] = useState<number | null>(null);

  /**
   * Initialize new report with default values
   */
  const initNewReport = (): void => {
    setErrorMessage(null);
    setNewReport(
      createInitialReport(currentWeek, employee?.minutesHoursAmount)
    );
  };

  /**
   * Filter and calculate statistics for reports
   */
  const filterReport = (reportData: TimeRecord[]) => {
    setTotalTime(getTotalTime(reportData));
    setTotalDay(getReportedDaysCount(reportData));
    setFilteredReports(reportData);
  };

  /**
   * Navigate to different weeks
   */
  const navigateWeek = (direction: 'prev' | 'next' | 'today') => {
    let newDay: Date;

    if (direction !== 'today') {
      const base = new Date(currentWeek);
      base.setDate(base.getDate() + (direction === 'next' ? 7 : -7));
      newDay = base;
    } else {
      newDay = new Date();
    }

    setCurrentWeek(newDay);
    filterReport(reports);
  };

  /**
   * Open modal for new report
   */
  const openNewReport = () => {
    initNewReport();
    setIsModalOpen(true);
  };

  /**
   * Open modal for editing existing report
   */
  const openEditReport = (id: number) => {
    setErrorMessage(null);
    const updateReport = reports.find(report => report.id === id);
    
    if (updateReport) {
      setNewReport({
        id: updateReport.id,
        date: updateReport.date,
        type: updateReport.type,
        typeID: updateReport.typeID,
        clockInTime: updateReport.clockInTime,
        clockOutTime: updateReport.clockOutTime,
        notes: updateReport.notes
      });
      setEditingReportId(id);
      setIsModalOpen(true);
    }
  };

  /**
   * Close report modal
   */
  const closeReportModal = () => {
    setIsModalOpen(false);
    setEditingReportId(null);
  };

  /**
   * Update existing report
   */
  const handleUpdateRecord = async () => {
    try {
      await timeRecordService.insertTimeRecord(newReport, "UpdateTimeRecordDataAsync");
      const storedTimeRecord = await timeRecordService.getTimeRecordsData(currentWeek);
      setReports(storedTimeRecord ?? []);
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  /**
   * Add new report
   */
  const handleAddNewRecord = async () => {
    try {
      await timeRecordService.insertTimeRecord(newReport, "InsertTimeRecordDataAsync");
      const storedTimeRecord = await timeRecordService.getTimeRecordsData(currentWeek);
      setReports(storedTimeRecord ?? []);
    } catch (error) {
      console.error('Error adding new report:', error);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newReport.clockInTime || !newReport.clockOutTime) {
      return;
    }

    // Validate for overlaps
    const newUpdateReports = [...reports, { ...newReport }];
    const validation = TimeRecordValidator.validateOverlappingReports(
      newUpdateReports,
      newReport
    );

    if (validation.length !== 0) {
      setErrorMessage(validation);
      return;
    }

    // Save report
    if (editingReportId !== null) {
      handleUpdateRecord();
      setEditingReportId(null);
    } else {
      handleAddNewRecord();
    }

    setIsModalOpen(false);
  };

  /**
   * Open delete confirmation
   */
  const onDeleteClick = (id: number) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  /**
   * Confirm and execute delete
   */
  const confirmDelete = async () => {
    if (itemToDelete !== null) {
      try {
        await timeRecordService.deleteTimeRecord(itemToDelete);
        const storedTimeRecord = await timeRecordService.getTimeRecordsData(currentWeek);
        setReports(storedTimeRecord ?? []);
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  /**
   * Cancel delete
   */
  const cancelDelete = () => {
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  /**
   * Get CSS classes for report type badge
   */
  const getReportTypeStyle = (type: number): string => {
    switch (type) {
      case 5: // Regular work
        return 'bg-green-100 text-green-800 border-green-200';
      case 1: // Sick leave
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 3: // Vacation
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 6: // Work from home
        return 'bg-red-100 text-red-800 border-red-200';
      case 4: // Military reserve
        return 'bg-pink-100 text-pink-800 border-red-200';
      case 2: // Paid absence
        return 'bg-orange-100 text-orange-800 orange-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * Load employee permissions
   */
  useEffect(() => {
    const permissionEmployee = authService.getCurrentEmployee();
    if (permissionEmployee) {
      setEditPermission(permissionEmployee.editPermision);
    }
  }, []);

  /**
   * Load user permissions
   */
  useEffect(() => {
    const permissionUser = authService.getCurrentUser();
    if (permissionUser) {
      setAllowAddReport(permissionUser.allowAddReport);
    }
  }, []);

  /**
   * Load employee data and reports for current week
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

    const fetchData = async () => {
      try {
        const storedTimeRecord = await timeRecordService.getTimeRecordsData(currentWeek);
        setReports(storedTimeRecord ?? []);
        initNewReport();
      } catch (error) {
        console.error('Failed to fetch time records:', error);
        setReports([]);
      }
    };

    fetchData();
  }, [currentWeek]);

  /**
   * Filter reports when data changes
   */
  useEffect(() => {
    filterReport(reports);
  }, [reports]);

  /**
   * Load report types from localStorage
   */
  useEffect(() => {
    const json = localStorage.getItem("timeHourReportsTypes");
    if (json) {
      try {
        const list: TimeHourReportsType[] = JSON.parse(json);
        setTypeReports(list);
      } catch (e) {
        console.error("Failed to parse localStorage:", e);
      }
    }
  }, []);

  return {
    // State
    employee,
    reports,
    filteredReports,
    typeReports,
    currentWeek,
    totalTime,
    totalDay,
    editPermission,
    allowAddReport,
    
    // Modal state
    isModalOpen,
    newReport,
    editingReportId,
    errorMessage,
    
    // Confirm delete state
    isConfirmOpen,
    itemToDelete,
    contextMenuRowId,
    
    // Actions
    navigateWeek,
    openNewReport,
    openEditReport,
    closeReportModal,
    handleSubmit,
    setNewReport,
    onDeleteClick,
    confirmDelete,
    cancelDelete,
    setContextMenuRowId,
    getReportTypeStyle
  };
};
