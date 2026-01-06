import React, { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import type { Task } from './models/task.model';
import { createInitialTask } from './models/task.model';
import { useTaskModal } from './hooks/useTaskModal';
import TaskModalForm from './components/TaskModalForm';
import { useModal } from '../ModalContextType';

type TaskModalProps = {
  isOpen: boolean;
  editingId: number;
  taskDetails: Task | null;
  close: () => void;
  employee?: { id: number } | null;
};

const CreateUpdateTaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  editingId,
  taskDetails,
  close,
  employee,
}) => {
  // Initialize task with employee data
  const initialTaskData = useMemo(() => {
    // If editing existing task, use taskDetails
    if (taskDetails) {
      return taskDetails;
    }
    
    // For new task, create with employee ID
    const userId = employee?.id || 0;
    return createInitialTask(userId);
  }, [taskDetails, employee]);

  const {
    state,
    data,
    title,
    updateTaskDetails,
    handleEmployeeSelect,
    handleProjectSelect,
    handleStartDateChange,
    handleStartTimeChange,
    handleSave,
  } = useTaskModal({
    initialTask: initialTaskData,
    editingId,
    onClose: close,
  });

  if (!isOpen) return null;
  const { openModal, closeModal } = useModal();
useEffect(() => {
  if (isOpen) {
    openModal();
    return () => {
      closeModal();
    };
  }
}, [isOpen, openModal, closeModal]);
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      dir="rtl"
    >
      <div className="text-gray-800 bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative pt-1 flex items-center justify-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            {title}
          </h2>
          <button
            onClick={close}
            className="absolute left-0 w-8 h-8 flex items-center justify-center"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        {data.isLoading ? (
          <div className="p-4 text-center text-gray-500">טוען...</div>
        ) : (
          <TaskModalForm
            task={state.taskDetails}
            editingId={editingId}
            projects={data.projects}
            employees={data.employees}
            selectedProject={state.selectedProject}
            selectedEmployee={state.selectedEmployee}
            errors={state.errors}
            onTaskChange={updateTaskDetails}
            onEmployeeSelect={handleEmployeeSelect}
            onProjectSelect={handleProjectSelect}
            onStartDateChange={handleStartDateChange}
            onStartTimeChange={handleStartTimeChange}
          />
        )}

        {/* Actions */}
        <div className="flex gap-3 p-4">
          <button
            onClick={close}
            className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            type="button"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {editingId > 0 ? 'שמור שינויים' : 'הוסף משימה'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateUpdateTaskModal;