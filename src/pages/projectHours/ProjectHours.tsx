import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar, Plus } from 'lucide-react';
import type { Contract, Employee, HourReport, HourReportModal, Project, Step, SubContract } from '../../interface/interfaces';
import "tailwindcss";
import React from 'react';
import hourReportService, { getHourReportStepsModal, getStepsList, insertProjectHourReport } from '../../services/hourReportService';
import authService from '../../services/authService';
import ProjectFilter from '../shared/projectsFilter';
import { getProjectsList } from '../../services/TaskService';
import HourReportModalOpen from './HourReportModalOpen';
import EmployeeProfileCard from '../shared/employeeProfileCard';
//import HebrewDatePicker from 'react-hebrew-datepicker';
const ProjectHours = () => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  // const [modalTitle, setModalTitle] = useState<string>();
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
  const [errorMessage, setErrorMessage] = useState<string[] | null>(null);
  //const [error, setError] = useState<string | null>(null);
  const [editPermision, setEditPermision] = useState(false);
  const [isOpenProject, setIsOpenProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contracts, setContracts] = useState<Contract[] | null>(null);
  const [subContracts, setSubContracts] = useState<SubContract[] | null>(null);
  const [steps, setSteps] = useState<Step[] | null>(null);
  let reportingType="";
  let calculateclockOutTime = "";

  const [projectsList, setProjectsList] = useState<Project[]>(
    [{ id: 0, name: 'Loading...', hoursReportMethodID: 0 }]
  );




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
    
    calculateclockOutTime = ""
    if (employee?.minutesHoursAmount) {
      calculateclockOutTime = addTime("08:00", employee.minutesHoursAmount)
    }
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
    
    })
  }
  const [reports, setReports] = useState<HourReport[]>([]);



  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };


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


    if (reportingType === 'time-range') {
      
      const totalHours = calculateTotalHours(newReport.clockInTime ?? "", newReport.clockOutTime ?? "");
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

      const newItem = {
        id: newId,
        clockInTime: newReport.clockInTime || '',
        clockOutTime: newReport.clockOutTime || '',
        total: newReport.total || '',
        projectName: newReport.name || '',
      };
      const newUpdateReports = [...reports, newItem]
      const validateError = validateOverlappingReports(newUpdateReports)

      if (validateError.length !== 0) {
        setErrorMessage(validateError);
        return;
      } else {
        setErrorMessage(null);
      }
      const insertedReport = await insertProjectHourReport(newReport)
      if (insertedReport && insertedReport > 0) {
        setNewReport({ ...newReport, id: insertedReport })
        getHourReportsList()
      }

    }

    // ✅ Close only after successful handling

    setIsModalOpen(false);
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

  const getHourReportsList = async () => {
    const storedTimeRecord = await hourReportService.getHourReportProjectData(currentDay);
    setReports(storedTimeRecord ?? []);
  }

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
    // setError(null)
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
    if (selectedProject) {
      // setError(null)
      await initNewReport()
      setErrorMessage(null)
      setIsModalOpen(true)
      setIsOpenProject(false);

    }

  };


  return (

    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto h-full flex flex-col">

        {/* Employee Profile Section */}
        <EmployeeProfileCard
        employee={employee}
        ></EmployeeProfileCard>

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
                setOpenProjectList();
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
        <HourReportModalOpen
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          newReport={newReport}
          setNewReport={setNewReport}
          handleSubmit={handleSubmit}
          contracts={contracts}
          subContracts={subContracts}
          steps={steps}
          selectedProject={selectedProject || undefined}
          currentDay={currentDay}
          calculateclockOutTime={() => calculateclockOutTime}
          errorMessage={errorMessage ? errorMessage.join(', ') : ""}
        />
      )}


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
    </div>

  );
};

export default ProjectHours;