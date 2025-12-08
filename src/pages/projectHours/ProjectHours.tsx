import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import type {  Employee, HourReport, HourReportModal, Project } from '../../interface/interfaces';
import "tailwindcss";
import hourReportService from '../../services/hourReportService';
import authService from '../../services/authService';
import { getProjectsList } from '../../services/TaskService';
import HourReportModalOpen from './HourReportModalOpen';
import EmployeeProfileCard from '../shared/employeeProfileCard';
import ConfirmModal from '../shared/confirmDeleteModal';
//import HebrewDatePicker from 'react-hebrew-datepicker';
const ProjectHours = () => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
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
  const [editPermision, setEditPermision] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);





  const [newReport, setNewReport] = useState<HourReportModal>(
    {
      id: 0,
      date: new Date(),
      clockInTime: undefined,
      clockOutTime: undefined,
      notes: "",
      total: undefined,
      projectID: 0,
      contractID: 0,
      subContractID: 0,
      stepID: 0,
      hourReportMethodID: 0,
      employeeId: employee?.id ? Number(employee.id) : 0,

    }
  );

  
  const [reports, setReports] = useState<HourReport[]>([]);



  const filterReport = (reportData: HourReport[]) => {

    setTotalTime(getTotalTime(reportData));
    setFilteredReports(reportData);
  }

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
  const confirmDelete = async () => {
    if (itemToDelete !== null) {
      try {
        await hourReportService.deleteHourReport(itemToDelete); // שליחה לשרת
        const storedTimeRecord = await hourReportService.getHourReportProjectData(currentDay);
        setReports(storedTimeRecord ?? []);// רענון הנתונים מהשרת
      } catch (error) {
        console.error('Error adding new report:', error);
      }
    }
    setIsConfirmOpen(false);
    setItemToDelete(null);
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
        //initNewReport()
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
    setIsModalOpen(false);
    setEditingReportId(null);
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

  async function onUpdateClick(id: number) {
    let updateReport = await hourReportService.getFullHourReportProjectData(id);
    if (!updateReport) return;
    updateReport.date = currentDay;
    setNewReport(updateReport);
    setEditingReportId(id);
    const projectsData = await getProjectsList();
    if (projectsData) {
      setSelectedProject(projectsData.find((p: { id: number | undefined; }) => p.id === updateReport.projectID) || null);
    }
    // setError(null)
    setIsModalOpen(true);
  }




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
                setIsModalOpen(true);
                //  setOpenProjectList();
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
                  <span className={` text-xs md:text-base text-blue-600 font-semibold`}>
                    {report.projectName ?? 'כללי'}
                  </span>
                </div>



                {/* clockInTime Time */}

                <div className="w-[20%] text-center ">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-green-500 hidden md:block" />
                    <span className={` text-xs md:text-base ${report.clockInTime === '-' ? 'text-gray-400' : 'text-green-600 font-semibold'}`}>
                      {report.clockInTime}
                    </span>
                  </div>
                </div>

                {/* Clock Out */}
                <div className="w-[20%] text-center ">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-red-500 hidden md:block" />
                    <span className={` text-xs md:text-base ${report.clockOutTime === '-' ? 'text-gray-400' : 'text-red-600 font-semibold'}`}>
                      {report.clockOutTime}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="w-[20%] text-center  text-blue-600 font-semibold">
                  <span className={` text-xs md:text-base text-blue-600 font-semibold`}>
                    {report.total ?? '00:00'}
                  </span>
                </div>
               
                {contextMenuRowId === report.id && (
                  <div className=" top-2 left-1 flex  gap-1 z-10">
                    <button
                      onClick={() => {
                        if (report.id !== undefined) {
                          //setModalTitle('עדכון דיווח מתאריך: ' + report.date);
                          onUpdateClick(report.id);
                        }
                        setContextMenuRowId(null);
                      }
                      }
                      className=" text-gray-500 hover:text-gray-700 rounded-xl transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (report.id !== undefined) onDeleteClick(report.id);
                        setContextMenuRowId(null);
                      }}
                      className=" text-red-500 hover:text-red-700 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
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
          title={newReport.id ? "עדכון דיווח" : "הוספת דיווח חדש"}
          isOpen={isModalOpen}
          onClose={() => { getHourReportsList(); }}
          report={newReport}
          employee={employee}
          project={selectedProject!}

          currentDay={currentDay}
          editingReportId={editingReportId!}
        />
      )}


      {isConfirmOpen && (
        <ConfirmModal
          message="האם הנך בטוח שברצונך למחוק דיווח זה?"
          onOk={() => {
            confirmDelete();
          }}
          onCancel={() => {
            setIsConfirmOpen(false);
            setItemToDelete(null);
          }}
          okText="מחק"
          cancelText="ביטול"
        />

      )}

    </div>

  );
};

export default ProjectHours;