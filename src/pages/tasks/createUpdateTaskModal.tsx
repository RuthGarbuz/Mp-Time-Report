import React, { useEffect, useState } from "react";
import { ChevronDownIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { X } from "lucide-react";
import { Priority } from "../../enum";
import ProjectFilter from "../shared/projectsFilter";
import { getProjectsList } from "../../services/TaskService";
import type { Project, SelectEmployeesList, Task } from "../../interface/interfaces";



//type Employee = { id: number; name: string };

type TaskModalProps = {
    isOpen: boolean;
    editingId: number;
    newTaskDetails: Task;
    setNewTaskDetails: React.Dispatch<React.SetStateAction<Task>>;
    errorSubject?: string;
    errorTime?: string;
    errorRecipient?: string;
    resetNewTaskDetails: () => void;
    addDetailedTask: () => void;
    employeesList: SelectEmployeesList[];
};

const CreateUpdateTaskModal: React.FC<TaskModalProps> = ({
    isOpen,
    editingId,
    newTaskDetails,
    setNewTaskDetails,
    errorSubject,
    errorTime,
    errorRecipient,
    resetNewTaskDetails,
    addDetailedTask,
    employeesList,



}) => {
    if (!isOpen) return null;
    const [searchEmployee, setSearchEmployee] = useState("");
    const [isOpenEmployee, setIsOpenEmployee] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [title, setTitle] = useState('');

    const [projectsList, setProjectsList] = useState<Project[]>(
        [{ id: 0, name: 'Loading...', hoursReportMethodID: 0 }]
    );
    const [isOpenProject, setIsOpenProject] = useState(false);

    const setOpenProjectList = async () => {
        const projectsData = await getProjectsList();
        if (projectsData) {
            setProjectsList(projectsData as Project[]);
        }
        setIsOpenProject(true);
    }
    const filteredEmployees = employeesList.filter((emp) =>
        emp.name?.toLowerCase().includes(searchEmployee.toLowerCase())
    );

    const handleSelect = (emp: SelectEmployeesList) => {
        setNewTaskDetails((prev) => ({
            ...prev,
            recipientID: emp.id ? emp.id : 0,
        }));
        setSearchEmployee(emp.name ? emp.name : "");
        setIsOpenEmployee(false);
    };
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (editingId) {
                    const empName = employeesList.find(emp => emp.id === newTaskDetails.recipientID);
                    setSearchEmployee(empName?.name ?? "");
                    setTitle("עריכת משימה")
                }
                else {
                    setSearchEmployee("");
                    setTitle("הוספת משימה חדשה")

                }
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };
        fetchData();
    }, []);
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="relative pt-1 flex items-center justify-center mb-2">
                    <h2 className="text-lg font-semibold text-gray-800 text-center">{title}</h2>
                    <button
                        onClick={() => { resetNewTaskDetails(); }}
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
                            className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                dir="rtl"
                            />
                        </div>)}
                    {/* <div className="space-y-3 box-border p-4"> */}
                        {/* תאריך ושעת התחלה */}
                        {/* <div className="flex flex-wrap gap-2 w-full"> */}

                            {/* <div className="flex-1 min-w-[120px] sm:min-w-0"> */}
                            <div className="grid grid-cols-1 [@media(min-width:350px)]:grid-cols-2 gap-3 w-full">
  {/* תאריך התחלה */}
  <div>
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
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            {/* שעת התחלה */}
                             <div>
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
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* תאריך ושעת סיום */}
                        {/* <div className="flex flex-wrap gap-2 w-full mt-2
                ">
                            <div className="flex-1 min-w-[120px] sm:min-w-0"> */}
                            <div className="grid grid-cols-1 [@media(min-width:350px)]:grid-cols-2 gap-3 w-full mt-2">
  <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    תאריך סיום
                                </label>
                                <input
                                    type="date"
                                    value={newTaskDetails.dueDate}
                                    onChange={(e) =>
                                        setNewTaskDetails((prev) => ({
                                            ...prev,
                                            dueDate: e.target.value,
                                        }))
                                    }
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
 <div>
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
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
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

                            className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent${errorRecipient ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => { setIsOpenEmployee(!isOpenEmployee), setSearchEmployee(""); }}
                            className="pt-7 absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-purple-600"
                        >
                            <ChevronDownIcon className="h-6 w-6" />
                        </button>
                        {isOpenEmployee && filteredEmployees.length > 0 && (
                            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
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
                                className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            {/* מודאל */}
            {isOpenProject && (
                <ProjectFilter
                    isOpen={isOpenProject}
                    projectsList={projectsList}
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    handleOk={handleOk}
                    onClose={() => setIsOpenProject(false)}
                />
            )}
        </div>


    );
};

export default CreateUpdateTaskModal;