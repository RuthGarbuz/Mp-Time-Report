import React, { useEffect, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { X } from "lucide-react";
import { Priority } from "../../enum";
import { getProjectsList, insertTask, updateTask } from "../../services/TaskService";
import type { Project } from "../../interface/projectModel";
import type { SelectEmployeesList } from "../../interface/MaimModel";
import type { Task } from "../../interface/task/TaskModel";
import employeeService from "../../services/employeeService";
import AutoComplete from "../shared/autoCompleteInput";

type TaskModalProps = {
    isOpen: boolean;
    editingId: number;
    taskDetails: Task;
    close: () => void;
    employee?: any;
};

const CreateUpdateTaskModal: React.FC<TaskModalProps> = ({
    isOpen,
    editingId,
    taskDetails,
    close,
    employee
}) => {
    if (!isOpen) return null;
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [title, setTitle] = useState('');
  const [errorSubject, setErrorSubject] = useState("");
  const [errorTime, setErrorTime] = useState("");
  const [errorRecipient, setErrorRecipient] = useState("");
    const [projectsList, setProjectsList] = useState<Project[]>(
        [{ id: 0, name: 'Loading...', hoursReportMethodID: 0 }]
    );
      const [employeesList, setEmployeesList] = useState<SelectEmployeesList[]>(
    [{ id: 0, name: 'Loading...' }]
  );
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
    organizerID:employee?.id?? 0,
    recipientID: employee?.id?? 0
  });
   const [selectedEmployee, setSelectedEmployee] = useState<SelectEmployeesList | null>(null);
  // ...existing code...

  const handleEmployeeSelect = (emp: SelectEmployeesList) => {
    setSelectedEmployee(emp);
    setNewTaskDetails((prev) => ({
      ...prev,
      recipientID: emp.id ?? 0,
    }));
  };
      const resetError = () => {
    setErrorSubject("");
    setErrorTime("");
    setErrorRecipient("");
  }
   const hasChanges = () => {
        return JSON.stringify(taskDetails) !== JSON.stringify(newTaskDetails);
    };
const addDetailedTask = async () => {
    if (!hasChanges()) {
            close();
            return;
        }
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
    close();
    // if (newTaskDetails?.subject.trim()) {


    //resetNewTaskDetails();
  };
    const setEmployeList = async () => {
      const employeesData: SelectEmployeesList[] = await employeeService.getEmployeesList();
      if (employeesData) {
        setEmployeesList(employeesData as SelectEmployeesList[]);
      }
      if (editingId) {
                    const empName = employeesData.find(emp => emp.id ===(taskDetails!=null? taskDetails.recipientID:newTaskDetails.recipientID));
                    setSelectedEmployee(empName ?? null);
                    setTitle("עריכת משימה")
                }
                else {
                    setSelectedEmployee(null);
                    setTitle("הוספת משימה חדשה")

                }
    }
   

    const handleProjectSelect = (project:Project) => {
      setSelectedProject(project);
            setNewTaskDetails((prev: any) => ({
                ...prev,
                projectID: project.id,
                projectName: project.name
            }));
       
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if(taskDetails){
                    setNewTaskDetails(taskDetails);
                  
                }
                  setEmployeList();
                   const projectsData = await getProjectsList();
        if (projectsData) {
            setProjectsList(projectsData as Project[]);
        }
                
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };
        fetchData();
    }, []);
     useEffect(() => {
        setSelectedProject(newTaskDetails.projectID ? projectsList!.find(p => p.id === newTaskDetails.projectID) || null : null);
    }, [projectsList]);
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="text-gray-800 bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="relative pt-1 flex items-center justify-center mb-2">
                    <h2 className="text-lg font-semibold text-gray-800 text-center">{title}</h2>
                    <button
                        onClick={() => { close(); }}
                        className="absolute left-0  w-8 h-8 flex items-center justify-center"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>

                </div>
                {/* Scrollable body */}
                <div className="p-4 space-y-3 overflow-y-auto">


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
                            className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            dir="rtl"
                        />
                        {errorSubject && <p className="text-red-500 text-sm mt-1">{errorSubject}</p>}
                    </div>
                    {/* כותרת המשימה */}

                    {editingId > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                dir="rtl"
                            />
                        </div>)}
                    {/* <div className="space-y-3 box-border p-4"> */}
                        {/* תאריך ושעת התחלה */}
                        {/* <div className="flex flex-wrap gap-2 w-full"> */}

                            {/* <div className="flex-1 min-w-[120px] sm:min-w-0"> */}
                           <div className="grid grid-cols-1 [@media(min-width:350px)]:grid-cols-2 gap-3 w-full mt-2">
  {/* תאריך התחלה */}
 <div className="min-w-0">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    תאריך התחלה
                                </label>
                                <input
                                    type="date"
                                    value={newTaskDetails.startDate}
                                    onChange={(e) => {
                                        const newStartDate = e.target.value;
                                        setNewTaskDetails((prev) => {
                                            let updated = { ...prev, startDate: newStartDate };
                                            // if start date is after end date -> fix end date
                                            if (prev.dueDate && new Date(newStartDate) > new Date(prev.dueDate)) {
                                                updated.dueDate = newStartDate;
                                            }
                                            return updated;
                                        });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            {/* שעת התחלה */}
                               <div className=" mr-4 min-w-0">
                            {/* <div className="flex-1 min-w-[90px] sm:min-w-0"> */}
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    שעת התחלה
                                </label>
                                <input
                                    type="time"
                                    value={newTaskDetails.startTime}
                                    onChange={(e) => {
                                        const newStartTime = e.target.value;
                                        setNewTaskDetails((prev) => {
                                            let updated = { ...prev, startTime: newStartTime };

                                            // only check if same-day
                                            if (prev.startDate === prev.dueDate && prev.dueTime) {
                                                const [startH, startM] = newStartTime.split(":").map(Number);
                                                const [endH, endM] = prev.dueTime.split(":").map(Number);
                                                const startMinutes = startH * 60 + startM;
                                                const endMinutes = endH * 60 + endM;

                                                if (startMinutes >= endMinutes) {
                                                    // add 1 hour safely, wrap around 24h if needed
                                                    const newEndMinutes = (startMinutes + 60) % (24 * 60);
                                                    const newEndH = String(Math.floor(newEndMinutes / 60)).padStart(2, "0");
                                                    const newEndM = String(newEndMinutes % 60).padStart(2, "0");
                                                    updated.dueTime = `${newEndH}:${newEndM}`;
                                                }
                                            }

                                            return updated;
                                        });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* תאריך ושעת סיום */}
                        {/* <div className="flex flex-wrap gap-2 w-full mt-2
                ">
                            <div className="flex-1 min-w-[120px] sm:min-w-0"> */}
                            <div className="grid grid-cols-1 [@media(min-width:350px)]:grid-cols-2 gap-3 w-full mt-2">
<div className="mb-0 sm:mb-0">
    <label className="block text-sm font-medium text-gray-700 mb-1">
        תאריך סיום
    </label>
    <input
        type="date"
        value={newTaskDetails.dueDate}
        onChange={(e) => {
            const dateValue = e.target.value; // format: yyyy-MM-dd
            setNewTaskDetails((prev) => ({
                ...prev,
                dueDate: dateValue,
            }))
        }}
        onBlur={(e) => {
            // Format display as dd/MM/yyyy when losing focus
            const dateValue = e.target.value;
            if (dateValue) {
                const [year, month, day] = dateValue.split('-');
                e.target.setAttribute('data-display', `${day}/${month}/${year}`);
            }
        }}
        className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        style={{ colorScheme: 'light' }}
    />
</div>
<div className="mb-0 sm:mb-0 mr-4">
                            {/* <div className="flex-1 min-w-[90px] sm:min-w-0"> */}
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    שעת סיום
                                </label>
                                <input
                                    type="time"
                                    value={newTaskDetails.dueTime}
                                    onChange={(e) =>
                                        setNewTaskDetails((prev) => ({
                                            ...prev,
                                            dueTime: e.target.value,
                                        }))
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    {/* </div> */}


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
                                className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
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
<AutoComplete
    items={employeesList}
    selectedItem={selectedEmployee}
    onSelect={handleEmployeeSelect}
    getItemId={(emp) => emp.id ?? 0}
    getItemLabel={(emp) => emp.name ?? ""}
    placeholder="בחר מקבל..."
    height={2}
/>
                       
                        {errorRecipient && <p className="text-red-500 text-sm mt-1">{errorRecipient}</p>}
                    </div>
                    {/* פרויקט */}

                        <div className="relative w-full"
                        >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            פרויקט
                        </label>
                        
                            <AutoComplete
                                    items={projectsList}
                                    selectedItem={selectedProject}
                                    onSelect={(project) => {
                                        handleProjectSelect(project);
                                        // update your state with project.id
                                    }}
                                    getItemId={(project: any) => project.id}
                                    getItemLabel={(project: any) => project.name}
                                    placeholder="בחר פרויקט..."
                                    height={2}
                                />
                           
                        </div>
                    {/* כפתורי פעולה */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => {
                                close();
                            }}
                            className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                            ביטול
                        </button>
                        <button
                            onClick={() => {addDetailedTask(); }}
                            // disabled={!newTaskDetails?.subject.trim()}
                            className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {title.includes("עריכת") ? "שמור שינויים" : "הוסף משימה"}
                        </button>
                    </div>
                </div>
            </div>
            
        </div>


    );
};

export default CreateUpdateTaskModal;