import React, { useEffect, useState } from 'react';
import { Plus, Check, Edit2, Trash2, X, Clock } from 'lucide-react';
import { deleteTask, getProjectsList, getTasksList, insertTask, saveCompletedTask, updateTask } from '../services/TaskService';
import type { Project, SelectEmployeesList, Task } from '../interface/interfaces';
import { Priority } from '../enum';
import authService from '../services/authService';
import employeeService from '../services/employeeService';
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/solid';

export default function TaskManager() {
  const [tasksList, setTasksList] = useState<Task[]>([]);

  const [selectedTaskID, setSelectedTaskID] = useState<number | null>(null);
  const [recipientID, setRecipientID] = useState<number>();
  const [employeesList, setEmployeesList] = useState<SelectEmployeesList[]>(
    [{ id: 0, name: 'Loading...' }]
  );
  const [projectsList, setProjectsList] = useState<Project[]>(
    [{ id: 0, name: 'Loading...' , HoursReportMethodID:0}]
  );
  const [loaded, setLoaded] = useState(false);
  const [loadedProject, setLoadedProject] = useState(false);


  const [title, setTitle] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number>(0);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('today');
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  // const [openError, setOpenError] = useState(false)
  const [errorSubject, setErrorSubject] = useState("");
  const [errorTime, setErrorTime] = useState("");
  const [errorRecipient, setErrorRecipient] = useState("");

  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'  
  const [isOpenProject, setIsOpenProject] = useState(false);
  const [searchProject, setSearchProject] = useState("");
    const [searchEmployee, setSearchEmployee] = useState("");
  const [isOpenEmployee, setIsOpenEmployee] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  // נתוני משימה חדשה מפורטים

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
    // setOpenError(false)
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
      organizerID: 0,
      recipientID: 0
    });
  };
  // const getEmployeesList=async()=>{ 
  //    if (!loaded) {
  //      const employeesData= await employeeService.getEmployeesList(); 
  // if(employeesData){
  //   setEmployeesList(employeesData as SelectEmployeesList[]);
  //     setLoaded(true);
  //   }
  // }
  // }
  // const getProjectList=async()=>{ 
  //    if (!loadedProject) {
  //      const projectsData= await getProjectsList(); 
  // if(projectsData){
  //   setProjectsList(projectsData as Project[]);
  //     setLoadedProject(true);
  //   }
  // }
  // }
  const addTask = () => {
    if (newTask.trim()) {
      // setTasks([...tasks, {
      //   id: Date.now(),
      //   text: newTask.trim(),
      //   description: '',
      //   completed: false,
      //   priority: newTaskPriority,
      //   startDate: new Date().toISOString().split('T')[0],
      //   startTime: '09:00',
      //   dueDate: new Date().toISOString().split('T')[0],
      //   dueTime: '17:00',
      //   project: ''
      // }]);
      setNewTask('');
    }
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
        setTasksList(tasksList.map(task =>
          task.taskID === editingId ? { ...newTaskDetails } : task
        ));
      }
      resetNewTaskDetails();
      return;
    }
    // if (newTaskDetails?.subject.trim()) {
    const taskData = await insertTask(newTaskDetails);
    if (taskData > 0) {
      setTasksList([...tasksList, { ...newTaskDetails, taskID: taskData }]);
    }
    // setTasks([...tasks, {
    //   id: Date.now(),
    //   ...newTaskDetails,
    //   completed: false
    // }]);
    resetNewTaskDetails();

    // }

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

  const startEdit = (id: any, text: string) => {
    const task = tasksList.find(task => task.taskID === id);
    if (task) setNewTaskDetails(task);
    setEditingId(id);
    setEditText(text);
    setTitle("עריכת משימה:")
    setShowAddModal(true)
  };
  const openNewTask = () => {
    setTitle("הוספת משימה חדשה:")
    setNewTaskDetails(prev => ({
      ...prev,
      priorityID: 0,
      subject: '',
    }))
    setShowAddModal(true)
  }
  const saveEdit = () => {
    if (editText.trim()) {
      setTasksList(tasksList.map(task =>
        task.taskID === editingId ? { ...task, text: editText.trim() } : task
      ));
    }
    setEditingId(0);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(0);
    setEditText('');
  };

  const today = new Date().toISOString().split('T')[0];
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() + 7);
  const weekEnd = thisWeek.toISOString().split('T')[0];

  // const filteredTasks = tasks.filter(task => {
  //   if (filter === 'today') return task.dueDate === today;
  //   if (filter === 'week') return task.dueDate <= weekEnd;
  //   return true;
  // });

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
  const setOpenProjectList = async () => {
    const projectsData = await getProjectsList();
    if (projectsData) {
      setProjectsList(projectsData as Project[]);
    }
    setIsOpenProject(true);
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch employees
        const employeesData = await employeeService.getEmployeesList();
        if (employeesData) {
          setEmployeesList(employeesData as SelectEmployeesList[]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      const taskData = await getTasksList(fromDate, toDate, activeTab);
      if (activeTab === 'received') {
        const user = authService.getCurrentUser();
        if (user && newTaskDetails) {
          setNewTaskDetails(prev => ({
            ...prev,
            recipientID: user.id,
            organizerID: user.id
          }));
        }
      }
      if (taskData) {
        setTasksList(taskData);
      }
    };
    fetchData();
  }, [fromDate, toDate, activeTab]);

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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'דחוף';
      case 'medium': return 'בינוני';
      case 'low': return 'נמוך';
      default: return 'רגיל';
    }
  };

  const currentTime = new Date().toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const currentDate = new Date().toLocaleDateString('he-IL');

  const handleOk = () => {
    if (selectedProject) {
      setNewTaskDetails((prev: any) => ({
        ...prev,
        projectID: selectedProject.id,
        projectName: selectedProject.name
      }));
    }
    setIsOpenProject(false);
  };

  const filteredProjects = projectsList.filter((p) =>
    p.name.toLowerCase().includes(searchProject.toLowerCase())
  );

  // חלון הוספת משימה מפורט
  //עריכת משימה
  // const AddTaskModal = () => (

  // );
 const filteredEmployees = employeesList.filter((emp) =>
    emp.name?.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  const handleSelect = (emp: SelectEmployeesList) => {
    setNewTaskDetails((prev) => ({
      ...prev,
      recipientID: emp.id? emp.id :0  ,
    }));
    setSearchEmployee(emp.name? emp.name : "");
    setIsOpenEmployee(false);
  };

  return (
    <div className=" text-gray-800 min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-4" dir="rtl">
      {/* Header */}
      {/* <div className="flex items-center justify-between mb-6 text-white">
        <Menu size={24} className="cursor-pointer" />
        <h1 className="text-xl font-bold">משימות נכחות</h1>
        <div className="w-6"></div>
      </div> */}

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-3 mb-4 shadow-lg">
        <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-2 px-4 text-center rounded-md transition-all 
     text-[clamp(0.9rem,1.5vw,1.3rem)] font-medium
    ${activeTab === 'received'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-purple-600'}`}
          >
            פגישות שקיבלתי
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-2 px-4 text-center rounded-md transition-all 
     text-[clamp(0.9rem,1.5vw,1.3rem)] font-medium
    ${activeTab === 'sent'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-purple-600'}`}
          >
            פגישות ששלחתי
          </button>
        </div>
        {/* <div className="relative flex items-center justify-between w-full mb-2">
  <div className="text-right">
    <div className="text-gray-600 text-xs">{currentDate}</div>
    <div className="text-purple-600 text-xs font-bold">{currentTime}</div>
  </div>

  <div className="absolute inset-x-0 flex justify-center">
    <div className="text-purple-600 text-lg font-medium">
      התקדמות המשימות
    </div>
  </div>
</div> */}
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
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={Priority.נמוכה}>{Priority[Priority.נמוכה]}</option>
              <option value={Priority.רגילה}>{Priority[Priority.רגילה]}</option>
              <option value={Priority.גבוהה}>{Priority[Priority.גבוהה]}</option>
            </select>
            <button
              onClick={addDetailedTask
                //addTask
              }
              className="inline-flex px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-700 hover:to-pink-600 transition-colors  items-center"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* כפתור הוספה מפורטת */}
          <button
            onClick={() => openNewTask()}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-colors font-medium"
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

                {/* {editingId === task.taskID ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={saveEdit}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-xl"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <> */}
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
                      startEdit(task.taskID, task.subject)
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
        //fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-80">
            <h2 className="text-xl font-bold text-gray-800 mb-4">מחק</h2>
            <p className="text-gray-700 mb-6">האם אתה בטוח שברצונך למחוק משימה זו?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400"
                onClick={() => {
                  setShowDeleteModal(false),
                  setSelectedTaskID(null)
                }}
              >
                ביטול
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                onClick={() => deleteTaskHandler()}
              >
                מחק
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Task Modal */}
      {showAddModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="text-gray-800 bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <button
              onClick={() => {
                resetNewTaskDetails();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">

            {/* תיאור המשימה */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                תיאור המשימה<span className="text-red-500">*</span>
              </label>

              <textarea
                value={newTaskDetails.subject}
                onChange={(e) =>
                  setNewTaskDetails(prev => ({
                    ...prev,
                    subject: e.target.value
                  }))
                }
                placeholder="הכנס תיאור מפורט למשימה..."
                rows={3}
                className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none${errorSubject ? "border-red-500" : "border-gray-300"
                  }`}
                dir="rtl"
              />
              {errorSubject && <p className="text-red-500 text-sm mt-1">{errorSubject}</p>}
            </div>
            {/* כותרת המשימה */}

            {editingId > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  פעולה שבוצעה
                </label>
                <input
                  type="text"
                  value={newTaskDetails.description}
                  onChange={(e) =>
                    setNewTaskDetails(prev => ({
                      ...prev,
                      description: e.target.value
                    }))
                  }
                  placeholder="הכנס כותרת למשימה..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  dir="rtl"
                />
              </div>)}
            {/* תאריך ושעת התחלה */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  תאריך התחלה
                </label>
                <input
                  type="date"
                  value={newTaskDetails.startDate}
                  onChange={(e) =>
                    setNewTaskDetails(prev => ({
                      ...prev,
                      startDate: e.target.value
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שעת התחלה
                </label>
                <input
                  type="time"
                  value={newTaskDetails.startTime}
                  onChange={(e) =>
                    setNewTaskDetails(prev => ({
                      ...prev,
                      startTime: e.target.value
                    }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* תאריך ושעת סיום */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  תאריך סיום
                </label>
                <input
                  type="date"
                  value={newTaskDetails.dueDate}
                  onChange={(e) =>
                    setNewTaskDetails(prev => ({
                      ...prev,
                      dueDate: e.target.value
                    }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שעת סיום
                </label>
                <input
                  type="time"
                  value={newTaskDetails.dueTime}
                  onChange={(e) =>
                    setNewTaskDetails(prev => ({
                      ...prev,
                      dueTime: e.target.value
                    }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            {errorTime && <p className="text-red-500 text-sm mt-1">{errorTime}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                רמת דחיפות
              </label>
              
              <div className="relative w-full">
  <select
    value={newTaskDetails.priorityID}
    onChange={(e) =>
      setNewTaskDetails((prev) => ({
        ...prev,
        priorityID: Number(e.target.value),
      }))
    }
    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
  >
    {/* <option value="">בחר עדיפות</option> */}
    <option value={Priority.נמוכה} className="hover:bg-purple-100">
      {Priority[Priority.נמוכה]}
    </option>
    <option value={Priority.רגילה} className="hover:bg-purple-100">
      {Priority[Priority.רגילה]}
    </option>
    <option value={Priority.גבוהה} className="hover:bg-purple-100">
      {Priority[Priority.גבוהה]}
    </option>
  </select>

  {/* Chevron icon on the right */}
  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center pr-3 text-gray-500">
    <ChevronDownIcon className="h-6 w-6" />
  </div>
</div>
            </div>
            <div className="relative w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מקבל<span className="text-red-500">*</span>
              </label>
<input
        type="text"
        value={searchEmployee}
        onChange={(e) => {
          setSearchEmployee(e.target.value);
          setIsOpenEmployee(true);
        }}
        // onFocus={() => setIsOpenEmployee(true)}
        placeholder="בחר מקבל..."
        className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent${
          errorRecipient ? "border-red-500" : "border-gray-300"
        }`}
      />
 <button
    type="button"
    onClick={() => {setIsOpenEmployee(!isOpenEmployee),setSearchEmployee("");}}
    className="pt-6 absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-purple-600"
  >
    <ChevronDownIcon className="h-6 w-6" />
  </button>
      {isOpenEmployee && filteredEmployees.length > 0 && (
        <ul className=" absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredEmployees.map((emp) => (
            <li
              key={emp.id}
              onClick={() => handleSelect(emp)}
              className="p-2 cursor-pointer  hover:bg-[#0078d7]  hover:text-white"
            >
              {emp.name}
            </li>
          ))}
        </ul>
      )}
              {/* <select hover:bg-purple-100
                value={newTaskDetails.recipientID}
                onChange={(e) => {
                  setNewTaskDetails(prev => ({
                    ...prev,
                    recipientID: Number(e.target.value)
                  }));
                }}
                className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent${errorRecipient ? "border-red-500" : "border-gray-300"
                  }`}
              >
                <option value="">בחר מקבל...</option>
                {employeesList.map(employee => (
                  <option className=" text-gray-800" key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select> */}
              {errorRecipient && <p className="text-red-500 text-sm mt-1">{errorRecipient}</p>}
            </div>
            {/* פרויקט */}
       
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                פרויקט
              </label>
              <div className="relative w-full"
              >
                <input
                  type="text"
                  value={newTaskDetails.projectName}
                  placeholder="בחר פרויקט..."
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />

                {/* כפתור קטן בצד ימין */}
                <button
                  type="button"
                  onClick={() => setOpenProjectList()}
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-purple-600"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
              </div>
            </div>
            {/* כפתורי פעולה */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  resetNewTaskDetails();
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={addDetailedTask}
                // disabled={!newTaskDetails?.subject.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {title.includes("עריכת") ? "שמור שינויים" : "הוסף משימה"}
              </button>
            </div>
          </div>
        </div>
      </div>)}

      {/* {openError && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 text-center">
            <h2 className="text-red-600 text-lg font-bold mb-3">
              ⚠ תאריך/שעה לא תקין
            </h2>
            <p className="text-gray-700 mb-4">
              אנא בדוק שהזנת תאריך ושעה חוקיים.
            </p>
            <button
              onClick={() => setOpenError(false)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              סגור
            </button>
          </div>
        </div>
      )} */}
      {/* מודאל */}
      {isOpenProject && (
        <div className=" min-h-40 fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-4">
            <h2 className="text-lg font-semibold mb-3">בחר פרויקט</h2>

            {/* חיפוש */}
            <input
              type="text"
              placeholder="חיפוש..."
              value={searchProject}
              onChange={(e) => setSearchProject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-3"
            />

            {/* רשימת פרויקטים */}
            <div className="min-h-60 max-h-60 overflow-y-auto border-gray-300 rounded-lg">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  onDoubleClick={() => {
                    setSelectedProject(p);
                    handleOk();
                  }}
                  className={`p-2 cursor-pointer hover:bg-purple-100 ${selectedProject?.id === p.id ? "bg-purple-200" : ""
                    }`}
                >
                  {p.name}
                </div>
              ))}
            </div>

            {/* כפתורים */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsOpenProject(false)}
                className="px-4 py-2 rounded-lg border border-gray-300"
              >
                ביטול
              </button>
              <button
                onClick={handleOk}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                אישור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>


  );
}


