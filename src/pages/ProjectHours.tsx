import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar, Plus, X } from 'lucide-react';
import type { Contract, Employee, HourReport, HourReportModal, Project, Step, SubContract, TimeHourReportsType, TimeRecord } from '../interface/interfaces';
import "tailwindcss";
import React from 'react';
import authService from '../services/authService';
import hourReportService, { getHourReportStepsModal, getStepsList, insertProjectHourReport } from '../services/hourReportService';
import { getProjectsList } from '../services/TaskService';
//import HebrewDatePicker from 'react-hebrew-datepicker';
const ProjectHours = () => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [modalTitle, setModalTitle] = useState<string>();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [contextMenuRowId, setContextMenuRowId] = useState<number | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [totalTime, setTotalTime] = useState<string>();
  // Date navigation
  const [currentDay, setCurrentDay] = useState(new Date());
  const [filteredReports, setFilteredReports] = useState<HourReport[] | null>(null);
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeReports, setTypeReports] = useState<TimeHourReportsType[]>([]);
  const [typeReport, setTypeReport] = useState<TimeHourReportsType | null>(null);
  const [editPermision, setEditPermision] = useState(false);
  const [searchProject, setSearchProject] = useState("");
  const [isOpenProject, setIsOpenProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contracs, setContracts] = useState<Contract[] | null>(null);
  const [subContracts, setSubContracts] = useState<SubContract[] | null>(null);
  const [steps, setSteps] = useState<Step[] | null>(null);
const [reportingType,setReportingType]=useState("");
let calculateclockOutTime = "";

  const [projectsList, setProjectsList] = useState<Project[]>(
    [{ id: 0, name: 'Loading...', hoursReportMethodID: 0 }]
  );


  const validateTimes = (clockInTime: string, clockOutTime: string) => {
    if (clockInTime && clockOutTime && clockOutTime < clockInTime) {
      setError("שעת יציאה לא יכולה להיות לפני שעת כניסה");
    } else {
      setError(null);
    }
  };

  const [newReport, setNewReport] = useState<HourReportModal>(
    {
      id: 0,
      name: "",
      date: new Date(),
      clockInTime: undefined,
      clockOutTime: undefined,
      notes: "",
      total: undefined,
      projectID: selectedProject?.id ?? 0,
      contractID: 0,
      subContractID: 0,
      stepID: 0,
      hourReportMethodID: selectedProject?.hoursReportMethodID ?? 0,
      employeeId: employee?.id ? Number(employee.id) : 0,
      // contractsList: [],
      // subContractsList: [],
      // stepsList: []
    }
  );
  //reportingType: 'simple' as 'simple' | 'time-range' | 'total',
  // const setSubContractsList = async (contractID:number) => {
  //   const subContractsData = await getSubContractsList(contractID);
  //   if (subContractsData) {
  //     setSubContracts(subContractsData);
  //   }
  // }
  //setHousrForFreeDay();
  const initNewReport = async () => {
    console.log('initNew')
    if (selectedProject?.hoursReportMethodID === 5) {
      const HourReportStepsData = await getHourReportStepsModal(selectedProject?.id ?? 0);
      if (HourReportStepsData) {
        if (HourReportStepsData.contractsList) {

          setContracts(HourReportStepsData.contractsList);
        }
        if (HourReportStepsData.subContractsList) {
          setSubContracts(HourReportStepsData.subContractsList);
        }
        if (HourReportStepsData.stepsList.length > 0) {
          console.log('stepsList', HourReportStepsData.stepsList)

          setSteps(HourReportStepsData.stepsList);
        }
      }
    }
    else if (selectedProject?.hoursReportMethodID === 3) {
      setSubContracts(null)
      setContracts(null)
      setSteps(null)

    }
    else if (selectedProject) {
      let StepList = await getStepsList(selectedProject?.id ?? 0);
      if (StepList && StepList.length > 0) {
         console.log('stepsList4', StepList)
        setSteps(StepList);
      }
      setSubContracts(null)
      setContracts(null)
    }
    //let reportData= await hourReportService.getFullHourReportProjectData(currentDay);
     calculateclockOutTime = ""
    if (employee?.minutesHoursAmount) {
      calculateclockOutTime = addTime("08:00", employee.minutesHoursAmount)
    }
    console.log("minutesHoursAmount",employee?.minutesHoursAmount)
    setNewReport({
      id: 0,
      name: "",
      date: currentDay,
      clockInTime: "08:00",
      clockOutTime: calculateclockOutTime,
      notes: "",
      total: employee?.minutesHoursAmount,
      projectID: selectedProject?.id ?? 0,
      contractID: 0,
      subContractID: 0,
      stepID: 0,
      hourReportMethodID: selectedProject?.hoursReportMethodID ?? 0,
      employeeId: employee?.id ? Number(employee.id) : 0,
      // contractsList: [],
      // subContractsList: [],
      // stepsList: []
    })
    setReportingType('time-range')
  }
  // Sample reports data
  const [reports, setReports] = useState<HourReport[]>([]);
  const [newReportList, setNewReportList] = useState<HourReport>({
    id: 0,
    clockInTime: '',
    clockOutTime: '',
    total: '',
    projectName: '',
  });

 
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  function toDateString(date: string | Date): string | null {
    if (!date) return null;

    let d: Date;

    if (date instanceof Date) {
      d = date;
    } else if (typeof date === "string") {
      d = new Date(date);
    } else {
      return null;
    }

    return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
  }

  const validateOverlappingReports = (reports: HourReport[]): string[] => {
    const errors: string[] = [];
    for (let i = 0; i < reports.length; i++) {
      const reportA = reports[i];

      if (!reportA.clockInTime || !reportA.clockOutTime) continue;
      if (reportA.clockInTime === "-" || reportA.clockOutTime === "-") continue;

      const startA = timeToMinutes(reportA.clockInTime);
      const endA = timeToMinutes(reportA.clockOutTime);

      for (let j = i + 1; j < reports.length; j++) {
        const reportB = reports[j];
        if (!reportB.clockInTime || !reportB.clockOutTime) continue;
        if (reportB.clockInTime === "-" || reportB.clockOutTime === "-") continue;

        const startB = timeToMinutes(reportB.clockInTime);
        const endB = timeToMinutes(reportB.clockOutTime);

        const isOverlap = startA < endB && startB < endA;

        if (isOverlap) {
          errors.push(`יש דיווחים מתאריך ${currentDay.toDateString()} שחופפים בשעות`);
          return errors;
        }
      }
    }

    return errors;
  };
  const filterReport = (reportData: HourReport[]) => {

    setTotalTime(getTotalTime(reportData));
    setFilteredReports(reportData);
  }


  //  setFilteredReports(reports);
  // Calculate total hours
  const calculateTotalHours = (clockInTime: string, clockOutTime: string) => {
    if (clockInTime === '-' || clockOutTime === '-') return '00:00';

    const clockInTimeMinutes = timeToMinutes(clockInTime);
    const clockOutTimeMinutes = timeToMinutes(clockOutTime);
    const totalMinutes = clockOutTimeMinutes - clockInTimeMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };
  const getTotalTime = (reports: HourReport[]): string => {
    let totalMinutes = 0;

    for (const report of reports) {
      //   if (report.typeID !== 5 && report.typeID !== 6) continue;
      if (!report.total || !report.total.includes(':')) continue;

      const [hoursStr, minutesStr] = report.total.split(':');

      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      if (!isNaN(hours) && !isNaN(minutes)) {
        totalMinutes += hours * 60 + minutes;
      }
    }


    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    const formattedHours = String(totalHours).padStart(2, '0');
    const formattedMinutes = String(remainingMinutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  };

  // Format date for display

  const onDeleteClick = (id: number) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  // כשמאשרים מחיקה
  const confirmDelete = () => {
    if (itemToDelete !== null) {
      setReports(prev => prev.filter(item => item.id !== itemToDelete));
      setFilteredReports(prev => prev?.filter(item => item.id !== itemToDelete) || []);
    }
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Always prevent default first

    if (error) {
      alert("לא ניתן לסגור את הטופס כל עוד קיימת שגיאה. אנא תקן/י את השדות.");

      return;
    }
    if(reportingType==='time-range'){ 
    if (!newReport.clockInTime || !newReport.clockOutTime) {
      return 0;
    }
    const totalHours = calculateTotalHours(newReport.clockInTime, newReport.clockOutTime);
    newReport.total = totalHours;
  }
    if (editingReportId !== null) {
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === editingReportId
            ? { ...report, ...newReport, id: editingReportId }
            : report
        )
      );
      setEditingReportId(null);
    } else {
      const newId = reports.length + 1;//get from update server and set newReportList
      setNewReportList({
        id: newId,
        clockInTime: newReport.clockInTime || '',
        clockOutTime: newReport.clockOutTime || '',
        total: newReport.total || '',
        projectName: newReport.name || '',
      })
      const newUpdateReports = [...reports, newReportList]
      const validateError = validateOverlappingReports(newUpdateReports)
      if (validateError.length !== 0) {
        alert(validateError);
        return;
      }
      console.log('newReport', newReport)
      const insertedReport = await insertProjectHourReport(newReport)
      if(insertedReport && insertedReport>0){
     setNewReport({ ...newReport, id: insertedReport })
     getHourReportsList()
      }
      setTypeReport(typeReports.find((t) => t.id === 5) || null)
    }

    // ✅ Close only after successful handling
    setIsModalOpen(false);
  };
 
  const closeModal = () => {
    if (error) {
      alert("לא ניתן לסגור את הטופס כל עוד קיימת שגיאה. אנא תקן/י את השדות.");
      return;
    }
    setTypeReport(typeReports.find((t) => t.id === 5) || null)
    setIsModalOpen(false)
  };



  const navigateDay = (direction: 'prev' | 'next' | 'today') => {

    let newDay: Date;

    if (direction !== 'today') {
      const base = new Date(currentDay); // לצורך חישוב יום חדש
      base.setDate(base.getDate() + (direction === 'next' ? 1 : -1));
      newDay = base;
    } else {
      newDay = new Date(); // היום
    }

    setCurrentDay(newDay);
    filterReport(reports);//newDay,

  };


  useEffect(() => {
    const permisionEmployee = authService.getCurrentEmployee();
    if (permisionEmployee) {
      setEditPermision(permisionEmployee.editPermision);
      setEmployee(permisionEmployee);
    }
  }, []);
  useEffect(() => {

    const fetchData = async () => {
      try {
        getHourReportsList()
        initNewReport()
      } catch (error) {
        console.error('Failed to fetch time records:', error);
        setReports([]);
      }
    };

    fetchData();
  }, [currentDay]);

  useEffect(() => {
    console.log("reports changed:", reports);
    filterReport(reports);//currentWeek,
  }, [reports]);

 const getHourReportsList=async()=>{
   const storedTimeRecord = await hourReportService.getHourReportProjectData(currentDay);
        setReports(storedTimeRecord ?? []);
}
  const getProfileImage = () => {
    const img = employee?.image?.trim();
    if (img && img !== 'null') {
      return `data:image/jpeg;base64,${img}`;
    }
    return '/images/default-profile.png'; // מ- public/images
  };
  // Add loading state while employee data is being fetched
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

  function onUpdateClick(id: number) {
   
    setEditingReportId(id);
    setError(null)
    setIsModalOpen(true);
  }
  function addTime(clockInTimeTime: string, duration: string): string {
    const [clockInTimeHours, clockInTimeMinutes] = clockInTimeTime.split(':').map(Number);
    const [durationHours, durationMinutes] = duration.split(':').map(Number);

    let totalMinutes = clockInTimeMinutes + durationMinutes;
    let totalHours = clockInTimeHours + durationHours;

    if (totalMinutes >= 60) {
      totalMinutes -= 60;
      totalHours += 1;
    }

    // Handle overflow beyond 24 hours if needed
    totalHours = totalHours % 24;

    const clockOutTimeHoursStr = String(totalHours).padStart(2, '0');
    const clockOutTimeMinutesStr = String(totalMinutes).padStart(2, '0');

    return `${clockOutTimeHoursStr}:${clockOutTimeMinutesStr}`;
  }
  const setOpenProjectList = async () => {
    const projectsData = await getProjectsList();
    if (projectsData) {
      setProjectsList(projectsData as Project[]);
    }
    setIsOpenProject(true);
  }
  const handleOk = async () => {
    setIsOpenProject(false);
    if (selectedProject) {
      setError(null)
      await initNewReport()
      setModalTitle('  דיווח שעות לפרויקט ' );
    }

  };
const changeReportingType=(type:string)=>{
setReportingType(type)
if(type=='total'){
  setNewReport({...newReport, clockInTime:undefined,clockOutTime:undefined })
}
else{
  setNewReport({...newReport, clockInTime:"08:00",clockOutTime:calculateclockOutTime })
}
}
  const filteredProjects = projectsList.filter((p) =>
    p.name.toLowerCase().includes(searchProject.toLowerCase())
  );
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto h-full flex flex-col">

        {/* Employee Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="flex items-center gap-4">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-3 border-white shadow-lg ring-2 ring-blue-100">
                <img
                  src={getProfileImage()}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Employee Name */}
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">{employee.name}</h1>
            </div>
          </div>
        </div>

        {/* Week Navigation */}

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDay('prev')}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="flex items-center gap-2 md:gap-3">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                {currentDay.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </h2>
            </div>

            <button
              onClick={() => navigateDay('next')}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500 hover:bg-blue-600  transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Add Report Button */}
        {editPermision && (
          <div className="mb-6">
            <button
              onClick={() => {
                setOpenProjectList()

              }}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              הוסף דיווח חדש
            </button>
          </div>
        )}

        {/* Reports Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Grid Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 md:p-3">
            <h3 className="text-lg md:text-xl font-bold mb-3">דיווחי שעות לפרויקטים</h3>
            <div className="flex flex-row items-center justify-between  font-semibold text-sm md:text-base">
              <div className="w-[40%] text-center">פרויקט</div>
              <div className="w-[20%] text-center">כניסה</div>
              <div className="w-[20%] text-center">יציאה</div>
              <div className="w-[20%] text-center">סה"כ</div>
              <div className="text-center"></div>
            </div>
          </div>

          {/* Grid Content */}
          <div className="divide-y divide-gray-100">

            {filteredReports?.map((report, index) => (

              <div
                ref={(el) => {
                  rowRef.current = el;
                }}
                key={report.id}
                onClick={() => setContextMenuRowId(report.id ?? null)}
                className={`relative p-2 md:p-3 hover:bg-gray-50 transition-colors duration-200
    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
    flex flex-row items-center justify-between gap-3 text-xs md:text-sm`}
              >
                {/* Project */}
                <div className="w-[40%] text-center">
                  <span className={`font-mono text-xs md:text-base text-blue-600 font-semibold`}>
                    {report.projectName ?? 'כללי'}
                  </span>
                </div>



                {/* clockInTime Time */}

                <div className="w-[20%] text-center font-mono">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-green-500 hidden md:block" />
                    <span className={`font-mono text-xs md:text-base ${report.clockInTime === '-' ? 'text-gray-400' : 'text-green-600 font-semibold'}`}>
                      {report.clockInTime}
                    </span>
                  </div>
                </div>

                {/* Clock Out */}
                <div className="w-[20%] text-center font-mono">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-red-500 hidden md:block" />
                    <span className={`font-mono text-xs md:text-base ${report.clockOutTime === '-' ? 'text-gray-400' : 'text-red-600 font-semibold'}`}>
                      {report.clockOutTime}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="w-[20%] text-center font-mono text-blue-600 font-semibold">
                  <span className={`font-mono text-xs md:text-base text-blue-600 font-semibold`}>
                    {report.total ?? '00:00'}
                  </span>
                </div>
                {/* Total Hours */}
                {/* <div className="text-center">
                  <span className={`font-mono text-xs md:text-base font-bold px-1 md:px-2 py-1 rounded-lg ${report.total === '00:00'
                      ? 'text-gray-400 bg-gray-100'
                      : 'text-blue-600 bg-blue-100'
                    }`}>
                    {report.total === 'NaN:NaN' ? '00:00' : report.total}
                  </span>
                </div> */}
                {contextMenuRowId === -900 && (//report.id 
                  <div className="absolute top-1 right-1 flex flex-col gap-1 z-10">
                    <button
                      onClick={() => {
                        if (report.id !== undefined) onDeleteClick(report.id);
                        setContextMenuRowId(null);
                      }}
                      className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded shadow"
                    >
                      מחק
                    </button>

                    <button
                      onClick={() => {
                        if (report.id !== undefined) {
                          //   setModalTitle('עדכון דיווח מתאריך: ' + report.date);
                          onUpdateClick(report.id);
                        }
                        setContextMenuRowId(null);
                      }}
                      className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded shadow"
                    >
                      עדכון
                    </button>
                  </div>
                )}
              </div>

            ))}

          </div>

        </div>
        {isConfirmOpen && (
          <div className="fixed inset-0  bg-opacity-40 backdrop-blur-sm backdrop-saturate-150 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
              <h2 className="text-lg font-bold text-gray-800 mb-4">אישור מחיקה</h2>
              <p className="text-sm text-gray-600 mb-6">האם הנך בטוח שברצונך למחוק את הדיווח?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setIsConfirmOpen(false);
                    setItemToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
                >
                  ביטול
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition"
                >
                  אישור מחיקה
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {/* <User className="w-5 h-5 text-green-600" /> */}
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">שעות שדווחו</h4>
            <p className="text-2xl font-bold text-green-600">{totalTime}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">שעות תקן ליום</h4>
            <p className="text-2xl font-bold text-blue-600">{employee.minutesHoursAmount}</p>
          </div>


        </div>
      </div>
{isModalOpen && (
        <div className="text-gray-800 fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800"> דיווח שעות לפרויקט</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
                <form onSubmit={handleSubmit} className="2 space-y-2">
              
            <div className="space-y-4">
                {/* Project Name and Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      שם פרויקט
                    </label>
                    <input
                      type="text"
                      value={selectedProject?.name}
                      onChange={(e) => setNewReport({...newReport, projectID:selectedProject?.id ?? 0 })}
                     className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                     disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      תאריך
                    </label>
                    <input
                      type="date"
                  value={currentDay ? currentDay.toISOString().split("T")[0] : ""}
                  onChange={(e) => setNewReport({ ...newReport, date: new Date(e.target.value) })}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  required
                  disabled
                    />
                  </div>
                </div>

                {/* Reporting Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    אופן דיווח שעות
                  </label>
                  <div className="space-y-2">
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reportingType === 'time-range'}
                        onChange={() => changeReportingType('time-range')}
                        className="ml-2 text-blue-500"
                      />
                      <span className="text-sm">משעה עד שעה</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reportingType === 'total'}
                        onChange={() => changeReportingType('total')}
                        className="ml-2 text-blue-500"
                      />
                      <span className="text-sm">סה"כ שעות</span>
                    </label>
                  </div>

                  {/* Time Range */}
                  {reportingType === 'time-range' && (
                     <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    שעת כניסה
                  </label>
                  <input
                    type="time"
                    value={newReport.clockInTime}
                    onChange={(e) => setNewReport({ ...newReport, clockInTime: e.target.value })}
                    onBlur={() => {
                      if (newReport.clockInTime && newReport.clockOutTime) {
                        validateTimes(newReport.clockInTime, newReport.clockOutTime)
                      }
                    }
                    }
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    שעת יציאה
                  </label>
                  <input
                    type="time"
                    value={newReport.clockOutTime}
                    onChange={(e) =>
                      setNewReport({ ...newReport, clockOutTime: e.target.value })}
                    onBlur={() => {
                      if (newReport.clockInTime && newReport.clockOutTime) {
                        validateTimes(newReport.clockInTime, newReport.clockOutTime)
                      }
                    }
                    }
                    className={`text-black w-full px-4 py-3 border rounded-lg transition-all duration-200 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                      } focus:border-transparent`}
                  // disabled={newReport.type === 'חופש'}
                  />
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                </div>
              </div>
                  )}

                  {/* Total Hours */}
                  {reportingType === 'total' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        סה"כ שעות
                      </label>
                      <input
                        type="time"
                        // step="0.5"
                        value={
                         newReport.total
                           ? newReport.total.padStart(5, "0") // ensures "8:00" → "08:00"
                           : ""
  }
                        onChange={(e) => setNewReport({...newReport, total: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                 {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  הערות
                </label>
                <textarea

                  value={newReport.notes}
                  onChange={(e) => setNewReport({ ...newReport, notes: e.target.value })}
                  className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="הערות נוספות (אופציונלי)"
                />
              </div>
              {/* Contract */}
              {contracs && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    חוזה *
                  </label>
                  <select
                    value={newReport.contractID}
                    onChange={(e) => setNewReport({ ...newReport, contractID: Number(e.target.value) })}
                 className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  >
                    <option value="">בחר חוזה</option>
                    {contracs?.map(contract => (
                      <option key={contract.id} value={contract.id}>{contract.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Sub-Contract */}
              {(newReport.contractID ?? 0) > 0&&subContracts && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    תת חוזה *
                  </label>
                  <select
                    value={newReport.subContractID}
                    onChange={(e) => setNewReport({ ...newReport, subContractID: Number(e.target.value) })}
                   className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  >
                    <option value="">בחר תת חוזה</option>
                    {subContracts
                      ? subContracts
                        .filter(sc => sc.contractID === newReport.contractID)
                        .map(subContract => (
                          <option key={subContract.id} value={subContract.id}>
                            {subContract.name}
                          </option>
                        )) : null
                    }
                  </select>
                </div>
              )}
              {/* Step */}
              {(newReport.subContractID ?? 0) > 0||(selectedProject?.hoursReportMethodID!=5&&selectedProject?.hoursReportMethodID!=3) &&steps&& (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                      שלב * 
                  </label>
                  <select
                    value={newReport.stepID}
                    onChange={(e) => setNewReport({ ...newReport, stepID: Number(e.target.value) })}
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  >
                    <option value="">בחר שלב</option>
                    {steps
                      ? steps
                        .filter( step =>
                         newReport.subContractID === 0 ||
                         step.subContractID === newReport.subContractID)
                        .map(step => (
                          <option key={step.id} value={step.id}>
                            {step.name}
                          </option>
                        )) : null
                    }
                  </select>
                </div>
              )}
             
              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  // onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  שמור דיווח
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200"
                >
                  ביטול
                </button>
              </div>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
 
      
      {/* מודאל */}
      {isOpenProject && (
        <div className="text-gray-800 min-h-40 fixed inset-0 flex items-center justify-center bg-black/50 z-50">
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
                  onDoubleClick={async () => {
                    setSelectedProject(p),
                      await handleOk(),
                      setIsModalOpen(true)
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
                onClick={async () => { await handleOk(), setIsModalOpen(true) }}
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
};

export default ProjectHours;