import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task } from '../models/task.model';
import type { Project } from '../../../interface/projectModel';
import { 
  createInitialModalState, 
  resetErrors, 
  type TaskModalState, 
  type TaskModalData 
} from '../models/taskModal.state';
import { TaskValidator } from '../models/taskValidation';
import { getProjectsList, insertTask, updateTask } from '../../../services/TaskService';
import employeeService from '../../../services/employeeService';
import type { SelectEmployeesList } from '../../../interface/MaimModel';

type UseTaskModalProps = {
  initialTask: Task;
  editingId: number;
  onClose: () => void;
};

export const useTaskModal = ({ initialTask, editingId, onClose }: UseTaskModalProps) => {
  const [state, setState] = useState<TaskModalState>(
    createInitialModalState(initialTask)
  );

  const [data, setData] = useState<TaskModalData>({
    projects: [{ id: 0, name: 'Loading...', hoursReportMethodID: 0 }],
    employees: [{ id: 0, name: 'Loading...' }],
    isLoading: true,
  });

  // Computed values
  const title = useMemo(
    () => (editingId > 0 ? 'עריכת משימה' : 'הוספת משימה חדשה'),
    [editingId]
  );

  const hasChanges = useMemo(
    () => TaskValidator.hasChanges(initialTask, state.taskDetails),
    [initialTask, state.taskDetails]
  );

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, employeesData] = await Promise.all([
          getProjectsList(),
          employeeService.getEmployeesList(),
        ]);

        setData({
          projects: (projectsData as Project[]) || [],
          employees: (employeesData as SelectEmployeesList[]) || [],
          isLoading: false,
        });

        // Set selected employee for editing
        if (editingId && employeesData) {
          const employee = employeesData.find(
            (emp:any) => emp.id === initialTask.recipientID
          );
          if (employee) {
            setState((prev) => ({
              ...prev,
              selectedEmployee: employee,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading modal data:', error);
        setData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadData();
  }, [editingId, initialTask.recipientID]);

  // Set selected project when projects load
  useEffect(() => {
    if (data.projects.length > 1 && state.taskDetails.projectID) {
      const project = data.projects.find(
        (p) => p.id === state.taskDetails.projectID
      );
      if (project) {
        setState((prev) => ({
          ...prev,
          selectedProject: project,
        }));
      }
    }
  }, [data.projects, state.taskDetails.projectID]);

  // Update task details
  const updateTaskDetails = useCallback(
    (updates: Partial<Task>) => {
      setState((prev) => ({
        ...prev,
        taskDetails: { ...prev.taskDetails, ...updates },
      }));
    },
    []
  );

  // Handle employee selection
  const handleEmployeeSelect = useCallback((employee: SelectEmployeesList) => {
    setState((prev) => ({
      ...prev,
      selectedEmployee: employee,
      taskDetails: {
        ...prev.taskDetails,
        recipientID: employee.id ?? 0,
      },
    }));
  }, []);

  // Handle project selection
  const handleProjectSelect = useCallback((project: Project) => {
    setState((prev) => ({
      ...prev,
      selectedProject: project,
      taskDetails: {
        ...prev.taskDetails,
        projectID: project.id,
        projectName: project.name,
      },
    }));
  }, []);

  // Handle start date change
  const handleStartDateChange = useCallback((newStartDate: string) => {
    setState((prev) => {
      const updates: Partial<Task> = { startDate: newStartDate };
      
      // If start date is after end date, update end date
      if (prev.taskDetails.dueDate && new Date(newStartDate) > new Date(prev.taskDetails.dueDate)) {
        updates.dueDate = newStartDate;
      }

      return {
        ...prev,
        taskDetails: { ...prev.taskDetails, ...updates },
      };
    });
  }, []);

  // Handle start time change
  const handleStartTimeChange = useCallback((newStartTime: string) => {
    setState((prev) => {
      const updates: Partial<Task> = { startTime: newStartTime };

      // Only adjust if same day
      if (prev.taskDetails.startDate === prev.taskDetails.dueDate) {
        const adjustedEndTime = TaskValidator.adjustEndTime(
          newStartTime,
          prev.taskDetails.dueTime
        );
        if (adjustedEndTime !== prev.taskDetails.dueTime) {
          updates.dueTime = adjustedEndTime;
        }
      }

      return {
        ...prev,
        taskDetails: { ...prev.taskDetails, ...updates },
      };
    });
  }, []);

  // Save task
  const handleSave = useCallback(async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    // Validate
    const validation = TaskValidator.validate(state.taskDetails);
    if (!validation.isValid) {
      setState((prev) => ({
        ...prev,
        errors: validation.errors,
      }));
      return;
    }

    // Reset errors
    setState((prev) => resetErrors(prev));

    try {
      if (editingId) {
        await updateTask(state.taskDetails);
      } else {
        await insertTask(state.taskDetails);
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  }, [editingId, state.taskDetails, hasChanges, onClose]);

  return {
    state,
    data,
    title,
    hasChanges,
    updateTaskDetails,
    handleEmployeeSelect,
    handleProjectSelect,
    handleStartDateChange,
    handleStartTimeChange,
    handleSave,
  };
};