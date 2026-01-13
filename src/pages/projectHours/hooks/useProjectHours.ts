import { useState, useEffect, useCallback, useMemo } from 'react';
import type { HourReport } from '../models/hourReport.model';
import { getTotalTime } from '../models/hourReport.model';
import hourReportService from '../../../services/hourReportService';
import authService from '../../../services/authService';
import type { Employee } from '../../../interface/TimeHourModel';

export const useProjectHours = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [reports, setReports] = useState<HourReport[]>([]);
  const [currentDay, setCurrentDay] = useState(new Date());
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [editPermission, setEditPermission] = useState(false);
  const [contextMenuRowId, setContextMenuRowId] = useState<number | null>(null);

  // Total time calculation
  const totalTime = useMemo(() => {
    return getTotalTime(reports);
  }, [reports]);

  // Load employee data
  useEffect(() => {
    const permissionEmployee = authService.getCurrentEmployee();
    if (permissionEmployee) {
      setEditPermission(permissionEmployee.editPermision);
      setEmployee(permissionEmployee);
    }
  }, []);

  // Load reports when day changes
  const loadReports = useCallback(async () => {
    try {
      const storedTimeRecord = await hourReportService.getHourReportProjectData(currentDay);
      setReports(storedTimeRecord ?? []);
    } catch (error) {
      console.error('Failed to fetch time records:', error);
      setReports([]);
    }
  }, [currentDay]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Navigate days
  const navigateDay = useCallback((direction: 'prev' | 'next' | 'today') => {
    let newDay: Date;

    if (direction !== 'today') {
      const base = new Date(currentDay);
      base.setDate(base.getDate() + (direction === 'next' ? 1 : -1));
      newDay = base;
    } else {
      newDay = new Date();
    }

    setCurrentDay(newDay);
  }, [currentDay]);

  // Open new report modal
  const openNewReport = useCallback(() => {
    setEditingReportId(null);
    setEditingReport(null);
    setIsModalOpen(true);
  }, []);

  // Open edit report modal
  const openEditReport = useCallback(async (id: number) => {
    const updateReport = await hourReportService.getFullHourReportProjectData(id);
    if (!updateReport) return;
    setEditingReportId(id);
    setEditingReport(updateReport);
    setIsModalOpen(true);
  }, []);

  // Delete confirmation
  const onDeleteClick = useCallback((id: number) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  }, []);

  // Confirm delete
  const confirmDelete = useCallback(async () => {
    if (itemToDelete !== null) {
      try {
        await hourReportService.deleteHourReport(itemToDelete);
        await loadReports();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
    setIsConfirmOpen(false);
    setItemToDelete(null);
  }, [itemToDelete, loadReports]);

  // Cancel delete
  const cancelDelete = useCallback(() => {
    setIsConfirmOpen(false);
    setItemToDelete(null);
  }, []);

  // Close modal
  const closeReportModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingReportId(null);
    setEditingReport(null);
    loadReports();
  }, [loadReports]);

  return {
    // State
    employee,
    reports,
    currentDay,
    totalTime,
    editingReportId,
    editingReport,
    isModalOpen,
    isConfirmOpen,
    editPermission,
    contextMenuRowId,
    setContextMenuRowId,

    // Actions
    navigateDay,
    openNewReport,
    openEditReport,
    onDeleteClick,
    confirmDelete,
    cancelDelete,
    closeReportModal,
    loadReports,
  };
};
