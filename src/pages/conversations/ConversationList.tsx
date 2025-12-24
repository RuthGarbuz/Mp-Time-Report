import React, { useEffect, useRef, useState } from 'react';

import { Trash2, Check, Search, X } from 'lucide-react';
import EmployeeProfileCard from '../shared/employeeProfileCard';
import type { Conversation, ConversationData } from '../../interface/ConversationModel';
import type { Employee } from '../../interface/TimeHourModel';
import timeRecordService from '../../services/timeRecordService';
import ConversationModalOpen from './conversationModalOpen';
import { deleteTask, saveCompletedTask, getConversationList, GetConversationsByID } from '../../services/TaskService';
import ConfirmModal from '../shared/confirmDeleteModal';
import { useModal } from '../ModalContextType';



const ConversationList: React.FC = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCallID, setSelectedCallID] = useState<number | null>(null);
    const [conversationData, setConversationData] = useState<ConversationData>(
        {
            id: 0,
            subject: '',
            contactID: 0,
            contactName: '',
            contactEmail: '',
            contactPhone: '',
            companyName: '',
            dueDate: '',
            startDate: '',
            isCompleted: false,
            isClosed: false,
            organizerID: 0,
            recipientID: 0,
            conversationLogTypeID: 0,
            projectName: ''
        }
    );
  const listRef = useRef<HTMLDivElement | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [callEntries, setCallEntries] = useState<Conversation[]>([]);
       const { openModal, closeModal } = useModal();
    const resetData = () => {
        setShowAddModal(false);
        closeModal();
        setSelectedCallID(0);
        setConversationData({
            id: 0,
            subject: '',
            contactID: 0,
            contactName: '',
            contactEmail: '',
            contactPhone: '',
            companyName: '',
            dueDate: new Date().toISOString().split('T')[0],
            startDate: new Date().toISOString().split('T')[0],
            isCompleted: false,
            isClosed: false,
            organizerID: employee?.id ?? 0,
            recipientID: employee?.id ?? 0,
            conversationLogTypeID: 0,
            projectName: ''
        });
    }
    const handleScroll = () => {
    if (!listRef.current) return;
    // const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    // if (scrollTop + clientHeight >= scrollHeight - 50) {
    //   setVisibleCount((prev) => Math.min(prev + 20, filteredContacts.length));
    // }
  };
 const filteredTasks = callEntries.filter((call) => {
    const term = searchTerm.trim().toLowerCase();
    return (
      call.subject?.toLowerCase().includes(term) 
     

    );
  });
  //const visibleContacts = filteredTasks.slice(0, visibleCount);
    const deleteTaskHandler = async () => {
        if (selectedCallID === null) return;
        const taskData = await deleteTask(selectedCallID, "DeleteConversationAsync");
        if (taskData) {
            setCallEntries(callEntries.filter(call => call.id !== selectedCallID));
        }
        setShowDeleteModal(false)
        setSelectedCallID(null)
        closeModal();
    };
    const saveConversation = async () => {
        
        const tasks = await getConversationList();
        if (tasks) {
            setCallEntries(tasks)
        }
        resetData();
    };
    const toggleTask = async (id: any) => {
        const updateClosedTask = callEntries.find(call => call.id === id);
        if (!updateClosedTask) return;
        const data = await saveCompletedTask(id, !updateClosedTask.isClosed, employee?.id ?? 0);
        if (data) {
            // setCallEntries(callEntries.map(call =>
            //     call.id === id ? { ...call, isClosed: !call.isClosed } : call
            // ));
              setCallEntries(prev => prev.filter(call => call.id !== id));

        }
    };
    useEffect(() => {
    closeModal();
  }, []);
    useEffect(() => {
        const fetchData = async () => {
            const conversationData = await getConversationList();

            if (conversationData) {
                setCallEntries(conversationData);
            }
            else { setCallEntries([]); }
        };
        fetchData();
    }, []);
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
    if (!employee) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">טוען נתונים...</p>
                </div>
            </div>
        );
    }
  
    const openConversationModal = async (ID: number) => {
        if (ID == 0) {
            resetData();
        }
        else {
            const conversationData = await GetConversationsByID(ID);
            if (conversationData) {
                setConversationData(conversationData);
            }
        }
     
        setShowAddModal(true);
        openModal();
    }

    return (
        <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto h-full flex flex-col">
                {/* <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 mb-4 max-w-4xl mx-auto"> */}

                <EmployeeProfileCard
                    employee={employee}
                ></EmployeeProfileCard>

                {/* Call Diary List Card */}

                <div className="bg-white rounded-3xl shadow-2xl p-6 ">

              
      <div className="bg-white shadow-md rounded-full mb-4">

        <div className="relative">

          <input
            // ref={(input) => input?.focus()}
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
                    {/* Call Entries */}

                    <div
                     ref={listRef}
          onScroll={handleScroll}
                     className="space-y-3 overflow-y-auto">
                        {filteredTasks.map((call, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    setSelectedCallID(call.id);
                                    openConversationModal(call.id ?? 0);
                                }}
                                className={`flex items-start gap-3 p-4 border rounded-2xl transition-all ${call.isClosed
                                    ? 'bg-gray-50 border-gray-200'
                                    : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm'
                                    }`}
                            >
                                {/* Checkbox */}
                                <div className="relative group">
                                    <button
                                        onClick={(e:any) => { 
                                            e.stopPropagation();
                                            toggleTask(call.id);
                                        }}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mt-1 flex-shrink-0 ${call.isClosed
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-gray-300 hover:border-green-400'
                                            }`}
                                    >
                                        {call.isClosed && <Check size={16} />}
                                    </button>
                                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-0.5 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                        סגירה
                                    </span>
                                </div>
                                
                                {/* <div className="w-6 h-6 border-2 border-gray-300 rounded-lg flex-shrink-0 mt-1"></div> */}

                                {/* Call Info */}
                                <div className="flex-1 min-w-0">
                                    <div
                                        className={`font-medium mb-1 truncate ${call.isClosed ? 'text-gray-500 line-through' : 'text-gray-800'
                                            }`}
                                        title={call.subject}
                                    >
                                        {call.subject}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                        <span>
                                            {call.startDate
                                                ? new Date(call.startDate).toLocaleDateString('he-IL')
                                                : ''}
                                            {' - '}
                                            {call.dueDate
                                                ? new Date(call.dueDate).toLocaleDateString('he-IL')
                                                : ''}
                                        </span>
                                    </div>
                                </div>

                                {/* Right: action buttons */}
                                <div className="flex-shrink-0 flex gap-1">
                                    {/* <button
      onClick={() => {
        setSelectedCallID(call.id);
        openModal(call.id ?? 0);
      }}
      className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
    >
      <Edit2 size={16} />
    </button> */}
                                    <div className="relative group">
                                        <button
                                            onClick={(e:React.MouseEvent<HTMLButtonElement>) => {
                                                e.stopPropagation();
                                                setSelectedCallID(call.id);
                                                setShowDeleteModal(true);
                                                openModal();
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        {/* <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                            מחק
                                        </span> */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>



                {/* Add/Edit Modal */}

                {(showAddModal) && (
                    <ConversationModalOpen
                        isOpen={showAddModal || selectedCallID !== null}
                        newConversation={conversationData}
                        setNewConversation={setConversationData}
                        resetNewConversation={resetData}
                        saveConversation={saveConversation}
                        userID={employee.id??0}
                    />

                )}
                {showDeleteModal && (

                    <ConfirmModal
                        message="האם אתה בטוח שברצונך למחוק משימה זו?"
                        onOk={() => {
                            deleteTaskHandler();
                            setShowDeleteModal(false);
                            setSelectedCallID(null);
                            closeModal();
                        }}
                        onCancel={() => {
                            setShowDeleteModal(false);
                            setSelectedCallID(null);
                            closeModal();
                        }}
                        okText="מחק"
                        cancelText="ביטול"
                    />


                )}
                {/* <div className="fixed bottom-20 right-6 z-40 group">
                    <button
                        onClick={() => {
                            openModal(selectedCallID ?? 0);
                        }}
                        className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                    <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        הוסף שיחה חדשה
                    </span>
                </div> */}
            </div>
        </div>
    );
};



export default ConversationList;