import { useRef } from 'react';
import { Check, Edit2, Trash2, X, Search } from 'lucide-react';
import { Priority } from '../../enum';
import { useModal } from '../ModalContextType';
import ConfirmModal from '../shared/confirmDeleteModal';
import CreateUpdateTaskModal from './createUpdateTaskModal';
import authService from '../../services/authService';
import { useTasks } from './hooks/useTasks';
export default function TaskManager() {
  const listRef = useRef<HTMLDivElement | null>(null);
  const { openModal, closeModal } = useModal();
  const currentUser = authService.getCurrentUser();

  const {
    filteredTasks,
    taskForm,
    filterState,
    showDeleteModal,
    taskStats,
    hasMore,
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
    loadMore,
  } = useTasks(openModal, closeModal);

  const handleScroll = () => {
    if (!listRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadMore();
    }
  };
 const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 3: return 'bg-red-100 text-red-800 border-red-200';

      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  return (
    <div className="text-gray-800 min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-4" dir="rtl">
      {/* Main Card */}
      <div className="bg-white rounded-3xl p-3 mb-4 shadow-lg">
        <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('sent')}
            className={`relative flex-1 px-4 py-2 font-semibold transition-colors ${
              filterState.activeTab === "sent"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text"
                : "text-gray-500"
            }`}
          >
            משימות ששלחתי
            {filterState.activeTab === "sent" && (
              <span className="absolute bottom-0 left-0 w-full h-1 rounded-t bg-gradient-to-r from-purple-600 to-pink-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('received')}
            className={`relative flex-1 px-4 py-2 font-semibold transition-colors ${
              filterState.activeTab === "received"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text"
                : "text-gray-500"
            }`}
          >
            משימות שקיבלתי
            {filterState.activeTab === "received" && (
              <span className="absolute bottom-0 left-0 w-full h-1 rounded-t bg-gradient-to-r from-purple-600 to-pink-500"></span>
            )}
          </button>
        </div>

        <div className="flex justify-center mb-3">
          <div className="relative w-30 h-30">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="#e5e7eb" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#8b5cf6"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(taskStats.completionPercentage / 100) * 283} 283`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-purple-600 text-2xl font-bold">
                {taskStats.completionPercentage}%
              </div>
              <div className="text-gray-600 text-sm">הושלמו</div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setDateFilter('today')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${
              filterState.filter === 'today'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-600'
            }`}
          >
            להיום
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${
              filterState.filter === 'week'
                ? 'bg-pink-500 text-white'
                : 'bg-pink-100 text-pink-600'
            }`}
          >
            להשבוע
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${
              filterState.filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            הכל
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={openNewTask}
            className="w-full py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-colors font-medium"
          >
            + הוספת משימה חדשה
          </button>
        </div>

        {/* Task Summary */}
        <div className="flex justify-between text-sm mb-1">
          <div className="text-center">
            <div className="text-gray-600">כל המשימות</div>
            <div className="text-xl font-bold text-gray-800">{taskStats.totalCount}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">בהמתנה</div>
            <div className="text-xl font-bold text-orange-600">{taskStats.pendingCount}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">הושלמו</div>
            <div className="text-xl font-bold text-green-600">{taskStats.completedCount}</div>
          </div>
        </div>
      </div>

      {/* Tasks List Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-3 relative w-full">
          <input
            type="text"
            placeholder="חפש לפי נושא..."
            value={filterState.searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-gray-600 w-full pr-4 pl-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {filterState.searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X size={18} />
            </button>
          ) : (
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          )}
        </div>

        <div
          ref={listRef}
          onScroll={handleScroll}
          className="space-y-3 h-[calc(100vh-220px)] overflow-y-auto rounded-2xl p-1"
        >
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filterState.filter === 'today' ? 'אין משימות להיום!' : 'אין משימות!'}
            </div>
          ) : (
            filteredTasks.map((task: any) => (
              <div
                key={task.taskID}
                onClick={() => startEdit(task.taskID)}
                className={`flex items-start gap-3 p-4 pl-2 border rounded-2xl transition-all cursor-pointer ${
                  task.isCompleted
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTask(task.taskID);
                  }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mt-1 flex-shrink-0 ${
                    task.isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {task.isCompleted && <Check size={16} />}
                </button>

                <div className="flex-1">
                  <div className={`font-medium mb-1 ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {task.subject}
                  </div>

                  {task.description && (
                    <div className={`text-sm mb-2 ${task.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priorityID)}`}>
                      {Priority[task.priorityID]}
                    </span>
                    {task.projectID > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                        {task.projectName}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {task.startTime} - {task.dueTime}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    style={{ visibility: 'hidden' }}
                    onClick={() => startEdit(task.taskID)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTaskID(task.taskID);
                      setShowDeleteModal(true);
                      openModal();
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
          {hasMore && (
            <div className="text-center text-sm text-gray-500 py-4">טוען עוד...</div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          message="האם אתה בטוח שברצונך למחוק משימה זו?"
          onOk={deleteTaskHandler}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedTaskID(null);
            closeModal();
          }}
          okText="מחק"
          cancelText="ביטול"
        />
      )}

      {taskForm.isOpen && (
        <CreateUpdateTaskModal
          isOpen={taskForm.isOpen}
          editingId={taskForm.editingId}
          taskDetails={taskForm.task}
          employee={{ id: currentUser.id }}
          close={() => {
            resetTaskForm();
            refreshData();
          }}
        />
      )}
    </div>
  );
}

