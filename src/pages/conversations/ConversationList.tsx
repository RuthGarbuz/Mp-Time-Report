import React from 'react';
import { Trash2, Check, Search, X } from 'lucide-react';
import EmployeeProfileCard from '../shared/employeeProfileCard';
import ConversationModalOpen from './conversationModalOpen';
import ConfirmModal from '../shared/confirmDeleteModal';
import { useModal } from '../ModalContextType';
import { useConversationList } from './hooks/useConversationList';

/**
 * Conversation List Component
 * Displays a list of conversations with search, edit, and delete options
 * Uses useConversationList hook to manage all logic
 */
const ConversationList: React.FC = () => {
  // =============== HOOKS ===============
  const { openModal, closeModal } = useModal();
  
  const {
    // State
    employee,
    conversations,
    searchTerm,
    filteredCount,
    showAddModal,
    showDeleteModal,
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
  } = useConversationList();

  // =============== LOADING STATE ===============
  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  // =============== HANDLERS ===============
  /**
   * Open conversation modal
   * Calls openModal from context to lock scroll
   */
  const handleOpenModal = async (id: number) => {
    await openConversationModal(id);
    openModal(); // Lock background scroll
  };

  /**
   * Close conversation modal
   * Calls closeModal from context to unlock scroll
   */
  const handleCloseModal = () => {
    closeConversationModal();
    closeModal(); // Unlock background scroll
  };

  /**
   * Open delete confirmation modal
   */
  const handleOpenDeleteModal = (id: number) => {
    openDeleteModal(id);
    openModal(); // Lock scroll
  };

  /**
   * Cancel deletion
   */
  const handleCancelDelete = () => {
    cancelDelete();
    closeModal(); // Unlock scroll
  };

  /**
   * Confirm deletion
   */
  const handleConfirmDelete = async () => {
    await confirmDelete();
    closeModal(); // Unlock scroll
  };

  // =============== RENDER ===============
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* Employee Profile */}
        <EmployeeProfileCard employee={employee} />

        {/* Conversations List Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6">
          {/* Search Bar */}
          <div className="bg-white shadow-md rounded-full mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="חפש לפי נושא שיחה..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-gray-600 w-full pr-4 pl-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-4 text-gray-400 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              ) : (
                <Search className="absolute left-3 top-4 text-gray-400" size={20} />
              )}
            </div>
          </div>

          {/* Conversations List */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="space-y-3 h-[calc(100vh-220px)] overflow-y-auto rounded-2xl p-1"
          >
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleOpenModal(conversation.id ?? 0)}
                className={`flex items-start gap-3 p-4 pl-2 border rounded-2xl transition-all cursor-pointer ${
                  conversation.isClosed
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm'
                }`}
              >
                {/* Checkbox - Mark as closed */}
                <div className="relative group">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleConversationClosed(conversation.id);
                    }}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mt-1 flex-shrink-0 ${
                      conversation.isClosed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {conversation.isClosed && <Check size={16} />}
                  </button>
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-0.5 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    סגירה
                  </span>
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium mb-1 truncate ${
                      conversation.isClosed ? 'text-gray-500 line-through' : 'text-gray-800'
                    }`}
                    title={conversation.subject}
                  >
                    {conversation.subject}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span>
                      {conversation.startDate
                        ? new Date(conversation.startDate).toLocaleDateString('he-IL')
                        : ''}
                      {' - '}
                      {conversation.dueDate
                        ? new Date(conversation.dueDate).toLocaleDateString('he-IL')
                        : ''}
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                <div className="flex-shrink-0 flex gap-1">
                  <div className="relative group">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteModal(conversation.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* "Loading more..." message */}
            {conversations.length < filteredCount && (
              <div className="text-center text-sm text-gray-500 py-4">Loading more...</div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showAddModal && (
          <ConversationModalOpen
            isOpen={showAddModal}
            newConversation={conversationData }
            setNewConversation={setConversationData}
            resetNewConversation={handleCloseModal}
            saveConversation={saveConversation}
            userID={employee.id ?? 0}
          />
        )}

        {showDeleteModal && (
          <ConfirmModal
            message="האם אתה בטוח שברצונך למחוק שיחה זו?"
            onOk={handleConfirmDelete}
            onCancel={handleCancelDelete}
            okText="מחק"
            cancelText="ביטול"
          />
        )}
      </div>
    </div>
  );
};

export default ConversationList;
