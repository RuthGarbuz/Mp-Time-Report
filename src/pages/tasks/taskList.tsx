import { useEffect, useState } from 'react';
import { Plus, Check, Edit2, Trash2, Clock } from 'lucide-react';
import { deleteTask, getTasksList, insertTask, saveCompletedTask, updateTask } from '../../services/TaskService';
import type {  SelectEmployeesList, Task } from '../../interface/interfaces';
import { Priority } from '../../enum';
import authService from '../../services/authService';
import ConfirmModal from '../shared/confirmDeleteModal';
import CreateUpdateTaskModal from './createUpdateTaskModal';
import employeeService from '../../services/employeeService';

export default function TaskManager() {
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [selectedTaskID, setSelectedTaskID] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number>(0);
  const [filter, setFilter] = useState('today');
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  // const [openError, setOpenError] = useState(false)
  const [errorSubject, setErrorSubject] = useState("");
  const [errorTime, setErrorTime] = useState("");
  const [errorRecipient, setErrorRecipient] = useState("");

  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'  
  const [employeesList, setEmployeesList] = useState<SelectEmployeesList[]>(
    [{ id: 0, name: 'Loading...' }]
  );

  // נתוני משימה חדשה מפורטים
  const [userID, setUserID] = useState(0);
  const [newTaskDetails, setNewTaskDetails] = useState<Task>({
    taskID: 0,
    subject: '',
    description: '',
    isCompleted: false,
    isClosed: false,
    priorityID: 2,
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '10:00',
    projectID: 0,
    projectName: '',
    organizerID: 0,
    recipientID: 0
  });
  const resetError = () => {
    setErrorSubject("");
    setErrorTime("");
    setErrorRecipient("");
  }
  const resetNewTaskDetails = () => {
    resetError();
    setShowAddModal(false);
    setEditingId(0);
    setNewTaskDetails({
      taskID: 0,
      subject: '',
      description: '',
      isCompleted: false,
      isClosed: false,
      priorityID: 2,
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '10:00',
      projectID: 0,
      projectName: '',
      organizerID: userID,
      recipientID: userID
    });
  };



  const addDetailedTask = async () => {
    resetError();
    let hasError = false;
    if (newTaskDetails.startDate > newTaskDetails.dueDate ||
      (newTaskDetails.startDate === newTaskDetails.dueDate &&
        newTaskDetails.startTime > newTaskDetails.dueTime)
    ) {
      setErrorTime("תאריך/שעה לא תקין");
      hasError = true;
      // setOpenError(true)
      // תאריך ושעה תקינים
    }
    if (!newTaskDetails.subject) {
      setErrorSubject("נדרש נושא המשימה");
      hasError = true;
    }
    if (!newTaskDetails.recipientID) {

      setErrorRecipient("נדרש מקבל המשימה");
      hasError = true;
    }
    if (hasError) {
      return;
    }
    if (editingId) {
      const success = await updateTask(newTaskDetails);
      if (success) {
        // setTasksList(tasksList.map(task =>
        //   task.taskID === editingId ? { ...newTaskDetails } : task
        // ));
      }
    }
    else {
      const taskData = await insertTask(newTaskDetails);
      if (taskData > 0) {

      }
    }
    // if (newTaskDetails?.subject.trim()) {

    const tasks = await getTasksList(fromDate, toDate, activeTab);
    if (tasks) {
      setTasksList(tasks)
    }
    resetNewTaskDetails();
  };

  const toggleTask = async (id: any) => {
    const updateCompletedTask = tasksList.find(task => task.taskID === id);
    if (!updateCompletedTask) return;
    const data = await saveCompletedTask(id, !updateCompletedTask.isCompleted, updateCompletedTask.organizerID);
    if (data) {
      setTasksList(tasksList.map(task =>
        task.taskID === id ? { ...task, isCompleted: !task.isCompleted } : task
      ));
    }
  };

  const deleteTaskHandler = async () => {
    if (selectedTaskID === null) return;
    const taskData = await deleteTask(selectedTaskID);
    if (taskData) {
      setTasksList(tasksList.filter(task => task.taskID !== selectedTaskID));
    }
    setShowDeleteModal(false)
    setSelectedTaskID(null)
  };

  const startEdit = (id: any) => {
    const task = tasksList.find(task => task.taskID === id);
    if (task) {
      
      setNewTaskDetails(task);
      setEditingId(id);
      setShowAddModal(true)
    }
  };
  const openNewTask = () => {
    setNewTaskDetails(prev => ({
      ...prev,
      priorityID: 0,
      subject: '',
    }))
    setEmployeList();
    setShowAddModal(true)
  }
 

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() + 7);



  const setData = ((dateDisplay: string) => {
    setFilter(dateDisplay);
    if (dateDisplay == 'week') {
      setFromDate(new Date());
      const endOfWeek = new Date();
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      setToDate(endOfWeek);
    }
    else {
      setFromDate(new Date());
      setToDate(new Date());
    }
  })
  const setEmployeList = async () => {
    const employeesData = await employeeService.getEmployeesList();
    if (employeesData) {
      setEmployeesList(employeesData as SelectEmployeesList[]);
    }
  }
 
  useEffect(() => {
    const fetchData = async () => {
      const taskData = await getTasksList(fromDate, toDate, activeTab);
      const user = authService.getCurrentUser();
      setUserID(user.id)
      if (taskData) {
        setTasksList(taskData);
      }
    };
    fetchData();
  }, [fromDate, toDate, activeTab]);
  //update reciptionID
  useEffect(() => {
    if (userID) {
      resetNewTaskDetails();
    }
  }, [userID]);
  const completedCount = tasksList.filter(task => task.isCompleted).length;
  const totalCount = tasksList.length;

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 3: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  
  return (
    <div className=" text-gray-800 min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-4" dir="rtl">


      {/* Main Card */}
      <div className="bg-white rounded-3xl p-3 mb-4 shadow-lg">
        <div className="flex mb-3 bg-gray-100 rounded-lg p-1">

          <button
            onClick={() => setActiveTab("sent")}
            className={`relative flex-1 px-4 py-2 font-semibold transition-colors ${activeTab === "sent"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text"
                : "text-gray-500"
              }`}
          >
            משימות ששלחתי
            {activeTab === "sent" && (
              <span className="absolute bottom-0 left-0 w-full h-1 rounded-t bg-gradient-to-r from-purple-600 to-pink-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("received")}
            className={`relative flex-1 px-4 py-2 font-semibold transition-colors ${activeTab === "received"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text"
                : "text-gray-500"
              }`}
          >
            משימות שקיבלתי
            {activeTab === "received" && (
              <span className="absolute bottom-0 left-0 w-full h-1 rounded-t bg-gradient-to-r from-purple-600 to-pink-500"></span>
            )}
          </button>
        </div>

        <div className="flex justify-center mb-3">
          <div className="relative w-30 h-30">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#8b5cf6"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${totalCount > 0 ? (completedCount / totalCount) * 283 : 0} 283`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-purple-600 text-2xl font-bold">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </div>
              <div className="text-gray-600 text-sm">הושלמו</div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setData('today')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${filter === 'today'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-600'
              }`}
          >
            להיום
          </button>
          <button
            onClick={() => {
              setData('week')
            }
            }
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${filter === 'week'
              ? 'bg-pink-500 text-white'
              : 'bg-pink-100 text-pink-600'
              }`}
          >
            להשבוע
          </button>
        </div>

        {/* Add New Task - Quick */}
        <div className="mb-6">
          <div className="text-gray-800 flex gap-2 mb-2 flex-wrap">
            <input
              type="text"
              value={newTaskDetails.subject}
              onChange={(e) =>
                setNewTaskDetails(prev => ({
                  ...prev,
                  subject: e.target.value
                }))}
              // onChange={(e) => setNewTask(e.target.value)}
              // onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="הוסף משימה מהירה..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <select
              value={newTaskDetails.priorityID}
              onChange={(e) =>
                setNewTaskDetails(prev => ({
                  ...prev,
                  priorityID: Number(e.target.value)
                }))}


              // value={newTaskPriority}
              // onChange={(e) => setNewTaskPriority(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={Priority.נמוכה}>{Priority[Priority.נמוכה]}</option>
              <option value={Priority.רגילה}>{Priority[Priority.רגילה]}</option>
              <option value={Priority.גבוהה}>{Priority[Priority.גבוהה]}</option>
            </select>
            <button
              type="button"
              onClick={
                addDetailedTask
              }
              className="inline-flex px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-700 hover:to-pink-600 transition-colors  items-center"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* כפתור הוספה מפורטת */}
          <button
            onClick={() => openNewTask()}
            className="w-full py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-colors font-medium"
          >
            הוספת משימה מפורטת
          </button>
        </div>

        {/* Task Summary */}
        <div className="flex justify-between text-sm mb-1">
          <div className="text-center">
            <div className="text-gray-600">כל המשימות</div>
            <div className="text-xl font-bold text-gray-800">{totalCount}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">בהמתנה</div>
            <div className="text-xl font-bold text-orange-600">{totalCount - completedCount}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">הושלמו</div>
            <div className="text-xl font-bold text-green-600">{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Tasks List Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-purple-600" size={20} />
          <h2 className="text-lg font-bold text-gray-800">
            {filter === 'today' ? 'משימות להיום' : 'משימות להשבוע'}
          </h2>
        </div>

        <div className="space-y-3">
          {tasksList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filter === 'today' ? 'אין משימות להיום!' : 'אין משימות לשבוע זה!'}
            </div>
          ) : (
            tasksList.map(task => (
              <div
                key={task.taskID}
                className={`flex items-start gap-3 p-4 border rounded-2xl transition-all ${task.isCompleted
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm'
                  }`}
              >
                <button
                  onClick={() => toggleTask(task.taskID)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mt-1 flex-shrink-0 ${task.isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                    }`}
                >
                  {task.isCompleted && <Check size={16} />}
                </button>

               
                <div className="flex-1">
                  <div className={`font-medium mb-1 ${task.isCompleted
                    ? 'text-gray-500 line-through'
                    : 'text-gray-800'
                    }`}>
                    {task.subject}
                  </div>

                  {task.description && (
                    <div className={`text-sm mb-2 ${task.isCompleted ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      {task.description}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priorityID)}`}>
                      {Priority[task.priorityID]}
                    </span>
                    {task.projectID && (
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
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingId(task.taskID),
                        startEdit(task.taskID)
                    }
                    }
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => { setSelectedTaskID(task.taskID); setShowDeleteModal(true); }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {/* </>
                )} */}
              </div>
            ))
          )}
        </div>
      </div>
      {showDeleteModal && (

        <ConfirmModal
          message="האם אתה בטוח שברצונך למחוק משימה זו?"
          onOk={() => {
            deleteTaskHandler();
            setShowDeleteModal(false);
            setSelectedTaskID(null);
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedTaskID(null);
          }}
          okText="מחק"
          cancelText="ביטול"
        />


      )}
      {/* Add Task Modal */}
      {showAddModal && (
        <CreateUpdateTaskModal
          isOpen={showAddModal}
          editingId={editingId}
          newTaskDetails={newTaskDetails}
          setNewTaskDetails={setNewTaskDetails}
          errorSubject={errorSubject}
          errorTime={errorTime}
          errorRecipient={errorRecipient}
          resetNewTaskDetails={resetNewTaskDetails}
          addDetailedTask={addDetailedTask}
          employeesList={employeesList}
        />
      )}
    </div>
  );
}

