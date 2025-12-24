import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar, Plus, Edit2, Trash2} from 'lucide-react';
import type { Employee, TimeHourReportsType } from '../../interface/TimeHourModel';
import type { TimeRecord } from '../../interface/HourReportModal';
import "tailwindcss";
import { TimeType } from '../../enum';
import React from 'react';
import authService from '../../services/authService';
import timeRecordService from '../../services/timeRecordService';
import EmployeeProfileCard from '../shared/employeeProfileCard';
import ConfirmModal from '../shared/confirmDeleteModal';
import ReportModal from './createUpdateReportModal';
import { useModal } from '../ModalContextType';
const ReportList = () => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [contextMenuRowId, setContextMenuRowId] = useState<number | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [totalTime, setTotalTime] = useState<string>();
  const [totalDay, setTotalDay] = useState<number>();
  // Date navigation
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [filteredReports, setFilteredReports] = useState<TimeRecord[] | null>(null);
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeReports, setTypeReports] = useState<TimeHourReportsType[]>([]);
  const [editPermision, setEditPermision] = useState(false);
  const [allowAddReport, setAllowAddReport] = useState(false);
const [errorMessage, setErrorMessage] = useState<string[] | null>(null);
const { openModal, closeModal } = useModal();

  const [newReport, setNewReport] = useState<TimeRecord>(
    {
      date: new Date(),
      type: TimeType.Regular,
      typeID: 5,
      clockInTime: "",
      clockOutTime: "",
      notes: ""
    }
  );
  //setHousrForFreeDay();
  const initNewReport = (): void => {
    setErrorMessage(null);
    let calculateclockOutTime = ""
    if (employee?.minutesHoursAmount) {
      calculateclockOutTime = addTime("08:00", employee.minutesHoursAmount)
    }
    setNewReport({
      date:formatDateOnly(currentWeek) as unknown as Date,
      type: TimeType.Regular,
      typeID: 5,
      clockInTime: "08:00",
      clockOutTime: calculateclockOutTime,
      notes: ""
    })
  }
  // Sample reports data
  const [reports, setReports] = useState<TimeRecord[]>([]);
 
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
 function toLocalISOString(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
   
    return `${d}-${m}-${y}`;
  }
  const validateOverlappingReports = (reports: TimeRecord[]): string[] => {
    const errors: string[] = [];
    for (let i = 0; i < reports.length; i++) {
      const reportA = reports[i];
      const dateA = toDateString(reportA.date);

      if (!reportA.clockInTime || !reportA.clockOutTime) continue;
      if (reportA.clockInTime === "-" || reportA.clockOutTime === "-") continue;

      const startA = timeToMinutes(reportA.clockInTime);
      const endA = timeToMinutes(reportA.clockOutTime);

      for (let j = i + 1; j < reports.length; j++) {
        const reportB = reports[j];
        if(reportB.id===reportA.id) continue; 
        const dateB = toDateString(reportB.date);
        if (dateA !== dateB) continue;
        if (!reportB.clockInTime || !reportB.clockOutTime) continue;
        if (reportB.clockInTime === "-" || reportB.clockOutTime === "-") continue;

        const startB = timeToMinutes(reportB.clockInTime);
        const endB = timeToMinutes(reportB.clockOutTime);

        const isOverlap = startA < endB && startB < endA;

        if (isOverlap) {
          errors.push(`יש דיווחים מתאריך ${toLocalISOString(new Date(reportA.date))} שחופפים בשעות`);
        }
      }
    }

    return errors;
  };
  const filterReport = (reportData: TimeRecord[]) => {
    setTotalTime(getTotalTime(reportData));
    setTotalDay(getReportedDaysCount(reportData))
    setFilteredReports(reportData);
  }
  const getReportedDaysCount = (reports: TimeRecord[]): number => {
    const uniqueDates = new Set<string>();

    for (const report of reports) {
      if (report.typeID !== 5 && report.typeID !== 6) continue;
      if (report.date) {
        uniqueDates.add(report.date.toString());
      }
    }
    return uniqueDates.size;
  };

  
  const getTotalTime = (reports: TimeRecord[]): string => {
    let totalMinutes = 0;

    for (const report of reports) {
      if (report.typeID !== 5 && report.typeID !== 6) continue;
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
  const formatWeekRange = (inputDate: string | number | Date) => {
    const date = new Date(inputDate);
    const dayOfWeek = date.getDay(); // 0 = Sunday

    // קבע את תחילת השבוע ליום ראשון
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (d: Date) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    };

    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  };
  const onDeleteClick = (id: number) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  // כשמאשרים מחיקה
  const confirmDelete = async () => {
    if (itemToDelete !== null) {
    try {
      await timeRecordService.deleteTimeRecord(itemToDelete); // שליחה לשרת
      const storedTimeRecord = await timeRecordService.getTimeRecordsData(currentWeek);
      setReports(storedTimeRecord ?? []);// רענון הנתונים מהשרת
    } catch (error) {
      console.error('Error adding new report:', error);
    }
    }
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };
  const handleUpdateRecord = async () => {
try {
      await timeRecordService.insertTimeRecord(newReport,"UpdateTimeRecordDataAsync"); // שליחה לשרת
      const storedTimeRecord = await timeRecordService.getTimeRecordsData(currentWeek);
      setReports(storedTimeRecord ?? []);// רענון הנתונים מהשרת
    } catch (error) {
      console.error('Error adding new report:', error);
    }
  }
  const handleAddNewRecord = async () => {
    try {
      await timeRecordService.insertTimeRecord(newReport,"InsertTimeRecordDataAsync"); // שליחה לשרת
      const storedTimeRecord = await timeRecordService.getTimeRecordsData(currentWeek);
      setReports(storedTimeRecord ?? []);// רענון הנתונים מהשרת
    } catch (error) {
      console.error('Error adding new report:', error);
    }
  };
  // Handle form submission
  const handleSubmit = (e: React.FormEvent<Element>) => {
    e.preventDefault(); // Always prevent default first

    
    if (!newReport.clockInTime || !newReport.clockOutTime) {
      return 0;
    }
    const newUpdateReports = [...reports, { ...newReport}]
    const validateError = validateOverlappingReports(newUpdateReports)
      if (validateError.length !== 0) {
        setErrorMessage(validateError);
        //alert(validateError);
        return;
      }
    // const totalHours = calculateTotalHours(newReport.clockInTime, newReport.clockOutTime);
    // newReport.total = totalHours;
    if (editingReportId !== null) {
          handleUpdateRecord()

      setEditingReportId(null);
    } else {
      
      handleAddNewRecord()
    }

    // ✅ Close only after successful handling
    setIsModalOpen(false);
    closeModal();
  };
 
  // Reset form when closing modal
  const closeReportModal = () => {
   
    //setTypeReport(typeReports.find((t) => t.id === 5) || null)
    setIsModalOpen(false)
    closeModal();
  };



  const navigateWeek = (direction: 'prev' | 'next' | 'today') => {
    let newDay: Date;

    if (direction !== 'today') {
      const base = new Date(currentWeek); // לצורך חישוב שבוע חדש
      base.setDate(base.getDate() + (direction === 'next' ? 7 : -7));
      newDay = base;
    } else {
      newDay = new Date(); // היום
    }

    setCurrentWeek(newDay);
    filterReport(reports);//newDay,

  };
function formatDateOnly(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
   useEffect(() => {
   
    const permisionEmployee = authService.getCurrentEmployee();
    if (permisionEmployee) 
      {
      setEditPermision(permisionEmployee.editPermision);
      }
  }, []);
  useEffect(() => {
    const permisionUser = authService.getCurrentUser();
    if (permisionUser) {
      setAllowAddReport(permisionUser.allowAddReport);
    }
   
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
    const fetchData = async () => {
      try {
        const storedTimeRecord = await timeRecordService.getTimeRecordsData(currentWeek);
        setReports(storedTimeRecord ?? []);
        initNewReport()
      } catch (error) {
        console.error('Failed to fetch time records:', error);
        setReports([]);
      }
    };

    fetchData();
  }, [currentWeek]);

  useEffect(() => {
    closeModal();
    filterReport(reports);//currentWeek,
  }, [reports]);
  useEffect(() => {
    const json = localStorage.getItem("timeHourReportsTypes");
    if (json) {
      try {
        const list: TimeHourReportsType[] = JSON.parse(json);
        setTypeReports(list);
      } catch (e) {
        console.error("Failed to parse localStorage:", e);
      }
    }
  }, []);
  const getReportTypeStyle = (type: number) => {
    switch (type) {
      case 5:
        return 'bg-green-100 text-green-800 border-green-200';
      case 1://"מחלה":
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 3://"חופש":
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 6://"עבודה מהבית":
        return 'bg-red-100 text-red-800 border-red-200';
      case 4://"מילואים":
        return 'bg-pink-100 text-pink-800 border-red-200';
      case 2://"העדרות בתשלום":
        return 'bg-orange-100 text-orange-800 orange-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }

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
    setErrorMessage(null);
    const updateReport = reports.find(report => report.id === id);
    setNewReport({
      id: updateReport ? updateReport.id : undefined,
      date: updateReport ? updateReport.date : new Date(),
      type: updateReport ? updateReport.type : TimeType.Regular,
      typeID:updateReport ? updateReport.typeID :5,
      clockInTime: updateReport ? updateReport.clockInTime : '',
      clockOutTime: updateReport ? updateReport.clockOutTime : '',
      notes: updateReport ? updateReport.notes : ''
    });
    setEditingReportId(id);
    setIsModalOpen(true);
    openModal();
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
              onClick={() => navigateWeek('prev')}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="flex items-center gap-2 md:gap-3">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                {formatWeekRange(currentWeek)}
              </h2>
            </div>

            <button
              onClick={() => navigateWeek('next')}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500 hover:bg-blue-600  transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Add Report Button */}
        { editPermision && allowAddReport && (
          
          <div className="mb-6">
            <button
              onClick={() => {
               // setError(null)
                initNewReport()
                setIsModalOpen(true)
                openModal();
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 md:p-4">
            <h3 className="text-lg md:text-xl font-bold mb-3">דיווחי נוכחות</h3>
            <div className="grid grid-cols-5 gap-1 md:gap-4 font-semibold text-sm md:text-base">
              <div className="text-center">תאריך</div>
              <div className="text-center">סוג</div>
              <div className="text-center">כניסה</div>
              <div className="text-center">יציאה</div>
              <div className="text-center">סה"כ</div>
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
    flex flex-row items-center justify-between gap-2 text-xs md:text-sm`}
              >
                {/* Date */}
                <div className="w-[20%] text-center">
                  <div className="font-medium text-gray-800">
                    {(() => {
                      const d = new Date(report.date);
                      const day = String(d.getDate()).padStart(2, '0');
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const year = String(d.getFullYear()).slice(-2);
                      return `${day}/${month}/${year}`;
                    })()}
                  </div>
                  <div className="text-xs text-gray-500 hidden md:block">
                    {new Date(report.date).toLocaleDateString('he-IL', { weekday: 'long' })}
                  </div>
                </div>

                {/* Report Type */}

                <div className="w-[20%] text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] md:text-xs ${getReportTypeStyle(report.typeID)}`}>
                    <span className="block md:hidden">
                      {report.typeID === 5 ? 'ר' :
                        report.typeID === 3 ? 'ח' :
                          report.typeID === 6 ? 'ב' :
                            report.typeID === 4 ? 'מ' :
                              report.typeID === 2 ? 'ת' :
                                report.typeID === 1 ? 'מח' :
                                  typeReports.find((type) => (type.id === report.typeID))?.name}
                    </span>
                    <span className="hidden md:block">
                      {typeReports.find((type) => (type.id === report.typeID))?.name}
                    </span>
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
                {/* Total Hours */}
                {contextMenuRowId ===report.id &&editPermision && allowAddReport && (//report.id 
                 <div className=" top-1 left-1 flex gap-1 z-10">
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
                    className="text-red-500 hover:text-red-700 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                  // <div className="absolute top-1 right-1 flex flex-col gap-1 z-10">
                  //   <button
                  //     onClick={() => {
                  //       if (report.id !== undefined) onDeleteClick(report.id);
                  //       setContextMenuRowId(null);
                  //     }}
                  //     className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded shadow"
                  //   >
                  //     מחק
                  //   </button>

                  //   <button
                  //     onClick={() => {
                  //       if (report.id !== undefined) {
                  //         //setModalTitle('עדכון דיווח מתאריך: ' + report.date);
                  //         onUpdateClick(report.id);
                  //       }
                  //       setContextMenuRowId(null);
                  //     }}
                  //     className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded shadow"
                  //   >
                  //     עדכון
                  //   </button>
                  // </div>
                )}
            
              </div>
            ))}
          </div>
        </div>
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
        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {/* <User className="w-5 h-5 text-green-600" /> */}
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">שעות שדווחו השבוע</h4>
            <p className="text-2xl font-bold text-green-600">{totalTime}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">שעות תקן ליום</h4>
            <p className="text-2xl font-bold text-blue-600">{employee.minutesHoursAmount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">ימי נוכחות</h4>
            <p className="text-2xl font-bold text-purple-600">{totalDay}</p>
          </div>
        </div>
      </div>

     
      {isModalOpen && (
        <ReportModal
        isOpen={isModalOpen}
        title={newReport.id ? "עדכון דיווח" : "הוספת דיווח חדש"}
        newReport={newReport}
        setNewReport={setNewReport}
        typeReports={typeReports}
        closeModal={closeReportModal}
        handleSubmit={handleSubmit}
        currentWeek={currentWeek}
         errorMessage={errorMessage ? errorMessage.join(', ') : ""}
      />
       
      )}
    </div>
  );
};

export default ReportList;