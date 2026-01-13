import React, { memo } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Priority } from '../../../enum';
import type { Task } from '../models/task.model';
import type { Project } from '../../../interface/projectModel';
import type { SelectEmployeesList } from '../../../interface/MaimModel';
import AutoComplete from '../../shared/autoCompleteInput';

type TaskModalFormProps = {
  task: Task;
  editingId: number;
  projects: Project[];
  employees: SelectEmployeesList[];
  selectedProject: Project | null;
  selectedEmployee: SelectEmployeesList | null;
  errors: {
    subject: string;
    time: string;
    recipient: string;
  };
  onTaskChange: (updates: Partial<Task>) => void;
  onEmployeeSelect: (employee: SelectEmployeesList) => void;
  onProjectSelect: (project: Project) => void;
  onStartDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
};

const TaskModalForm: React.FC<TaskModalFormProps> = memo(({
  task,
  editingId,
  projects,
  employees,
  selectedProject,
  selectedEmployee,
  errors,
  onTaskChange,
  onEmployeeSelect,
  onProjectSelect,
  onStartDateChange,
  onStartTimeChange,
}) => {
  return (
    <div className="p-4 space-y-3 overflow-y-auto">
      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          תיאור המשימה<span className="text-red-500">*</span>
        </label>
        <textarea
          value={task.subject}
          onChange={(e) => onTaskChange({ subject: e.target.value })}
          placeholder="הכנס תיאור מפורט למשימה..."
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          dir="rtl"
        />
        {errors.subject && (
          <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
          <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
          </div>
        )}
      </div>

      {/* Description (only for editing) */}
      {editingId > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            פעולה שבוצעה
          </label>
          <input
            type="text"
            value={task.description}
            onChange={(e) => onTaskChange({ description: e.target.value })}
            placeholder="הכנס כותרת למשימה..."
            className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            dir="rtl"
          />
        </div>
      )}

      {/* Start Date & Time */}
      <div className="grid grid-cols-1 [@media(min-width:350px)]:grid-cols-2 gap-3 w-full mt-2">
        <div className="min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            תאריך התחלה
          </label>
          <input
            type="date"
            value={task.startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="mr-4 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            שעת התחלה
          </label>
          <input
            type="time"
            value={task.startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Due Date & Time */}
      <div className="grid grid-cols-1 [@media(min-width:350px)]:grid-cols-2 gap-3 w-full mt-2">
        <div className="mb-0 sm:mb-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            תאריך סיום
          </label>
          <input
            type="date"
            value={task.dueDate}
            onChange={(e) => onTaskChange({ dueDate: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            style={{ colorScheme: 'light' }}
          />
        </div>

        <div className="mb-0 sm:mb-0 mr-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            שעת סיום
          </label>
          <input
            type="time"
            value={task.dueTime}
            onChange={(e) => onTaskChange({ dueTime: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {errors.time && (
        <p className="text-red-500 text-sm mt-1">{errors.time}</p>
      )}

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          רמת דחיפות
        </label>
        <div className="relative w-full">
          <select
            value={task.priorityID}
            onChange={(e) =>
              onTaskChange({ priorityID: Number(e.target.value) })
            }
            className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
          >
            <option value={Priority.נמוכה}>
              {Priority[Priority.נמוכה]}
            </option>
            <option value={Priority.רגילה}>
              {Priority[Priority.רגילה]}
            </option>
            <option value={Priority.גבוהה}>
              {Priority[Priority.גבוהה]}
            </option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center pr-3 text-gray-500">
            <ChevronDownIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Recipient */}
      <div className="relative w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          מקבל<span className="text-red-500">*</span>
        </label>
        <AutoComplete
          items={employees}
          selectedItem={selectedEmployee}
          onSelect={onEmployeeSelect}
          getItemId={(emp) => emp.id ?? 0}
          getItemLabel={(emp) => emp.name ?? ''}
          placeholder="בחר מקבל..."
          height={2}
        />
        {errors.recipient && (
          <p className="text-red-500 text-sm mt-1">{errors.recipient}</p>
        )}
      </div>

      {/* Project */}
      <div className="relative w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          פרויקט
        </label>
        <AutoComplete
          items={projects}
          selectedItem={selectedProject}
          onSelect={onProjectSelect}
          getItemId={(project) => project.id}
          getItemLabel={(project) => project.name}
          placeholder="בחר פרויקט..."
          height={2}
        />
      </div>
    </div>
  );
});

TaskModalForm.displayName = 'TaskModalForm';

export default TaskModalForm;