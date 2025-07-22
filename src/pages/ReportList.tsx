import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar, Plus, X } from 'lucide-react';
import timeRecordService  from '../services/timeRecordService';
import type { Employee, TimeHourReportsType, TimeRecord } from '../interface/interfaces';
//import { X }from "lucide-react";
import "tailwindcss";
import { TimeType } from '../enum';
import React from 'react';
import authService from '../services/authService';
const ReportList = () => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [modalTitle,setModalTitle]=useState<string>();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [contextMenuRowId, setContextMenuRowId] = useState<number | null>(null);
  const [employee, setEmployee] = useState<Employee  | null>(null);
  const [totalTime,setTotalTime]=useState<string>();
  const [totalDay,setTotalDay]=useState<number>();
  // Date navigation
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const[filteredReports ,setFilteredReports ]=useState<TimeRecord[]  | null>(null);
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
const [typeReports, setTypeReports] = useState<TimeHourReportsType[]>([]);
const [typeReport, setTypeReport] = useState<TimeHourReportsType | null>(null);
 const [editPermision, setEditPermision] = useState(false);
  
  const validateTimes = (clockInTime: string, clockOutTime: string) => {
    if (clockInTime && clockOutTime && clockOutTime < clockInTime) {
      setError("שעת יציאה לא יכולה להיות לפני שעת כניסה");
    } else {
      setError(null);
    }
  };
  const [newReport, setNewReport] = useState<TimeRecord >(
    {
    date: new Date(),
    type: TimeType.Regular,
    typeID:5,
    clockInTime: "",
    clockOutTime: "",
    notes: ""
  }
);
  //setHousrForFreeDay();
  const initNewReport=():void=>{
    let calculateclockOutTime=""
    if(employee?.minutesHoursAmount){
       calculateclockOutTime=addTime("08:00",employee.minutesHoursAmount)
    }
      setNewReport({
         date: new Date(),
         type: TimeType.Regular,
         typeID:5,
         clockInTime: "08:00",
         clockOutTime: calculateclockOutTime,
         notes: ""
      })
}
  // Sample reports data
  const [reports, setReports] = useState<TimeRecord[] >([]);
 
  const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
const validateOverlappingReports = (reports: TimeRecord[]): string[] => {
  const errors: string[] = [];
  for (let i = 0; i < reports.length; i++) {
    const reportA = reports[i];
    if (!reportA.clockInTime || !reportA.clockOutTime)continue;
    if (reportA.clockInTime === "-" || reportA.clockOutTime === "-") continue;

    const startA = timeToMinutes(reportA.clockInTime);
    const endA = timeToMinutes(reportA.clockOutTime);

    for (let j = i + 1; j < reports.length; j++) {
      const reportB = reports[j];

      if (reportB.date !== reportA.date) continue;
      if (!reportB.clockInTime || !reportB.clockOutTime)continue;
      if (reportB.clockInTime === "-" || reportB.clockOutTime === "-") continue;

      const startB = timeToMinutes(reportB.clockInTime);
      const endB = timeToMinutes(reportB.clockOutTime);

      const isOverlap = startA < endB && startB < endA;

      if (isOverlap) {
        errors.push(`יש דיווחים מתאריך ${reportA.date} שחופפים בשעות`);
        // errors.push(`שורות ${reportA.id} ו-${reportB.id} חופפות בתאריך ${reportA.date}`);
      }
    }
  }

  return errors;
};
//date:Date,
  const filterReport=(reportData: TimeRecord[])=>{

  setTotalTime(getTotalTime(reportData));
  setTotalDay(getReportedDaysCount(reportData))
  setFilteredReports(reportData);
console.log(reportData)
  }
  const getReportedDaysCount = (reports: TimeRecord[]): number => {
  const uniqueDates = new Set<string>();

  for (const report of reports) {
        if(report.typeID!==5&&report.typeID!==6)continue;
        if (report.date) {
        uniqueDates.add(report.date.toString());
    }
  }
  return uniqueDates.size;
};

  //  setFilteredReports(reports);
  // Calculate total hours
  const calculateTotalHours = (clockInTime: string, clockOutTime: string) => {
    if (clockInTime === '-' || clockOutTime === '-') return '00:00';
    
    const clockInTimeMinutes =timeToMinutes(clockInTime); 
    const clockOutTimeMinutes = timeToMinutes(clockOutTime);
    
    const totalMinutes = clockOutTimeMinutes - clockInTimeMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };
  const getTotalTime = (reports: TimeRecord[]): string => {
  let totalMinutes = 0;

  for (const report of reports) {
    if(report.typeID!==5&&report.typeID!==6)continue;
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
const confirmDelete = () => {
  if (itemToDelete !== null) {
    setReports(prev => prev.filter(item => item.id !== itemToDelete));
    setFilteredReports(prev => prev?.filter(item => item.id !== itemToDelete) || []);
  }
  setIsConfirmOpen(false);
  setItemToDelete(null);
};
 const handleAddNewRecord = async () => {
  try {
    await timeRecordService.insertTimeRecord(newReport); // שליחה לשרת
    const storedTimeRecord = await timeRecordService.getTimeRecordsData(currentWeek);
        setReports(storedTimeRecord ?? []);// רענון הנתונים מהשרת
  } catch (error) {
    console.error('Error adding new report:', error);
  }
};
  // Handle form submission
 const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault(); // Always prevent default first

  if (error) {
    alert("לא ניתן לסגור את הטופס כל עוד קיימת שגיאה. אנא תקן/י את השדות.");
    
    return;
  }
  if (!newReport.clockInTime || !newReport.clockOutTime) {
  return 0;
}
  const totalHours = calculateTotalHours(newReport.clockInTime, newReport.clockOutTime);
  newReport.total = totalHours;
  newReport.typeID = typeReport?.id ?? 0;
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
    const newId = reports.length + 1;
    const newUpdateReports=[...reports, { ...newReport, id: newId }]
    const validateError=validateOverlappingReports(newUpdateReports)
    if(validateError.length!==0)
    {
      alert(validateError);
    return;
    }
   handleAddNewRecord()
    // const addNewRecord =  timeRecordService.insertTimeRecord(newReport);
    // console.log(addNewRecord)
    //  setReports(newUpdateReports);
    setTypeReport(typeReports.find((t) => t.id === 5)|| null)
    //initNewReport();
  }

  // ✅ Close only after successful handling
  setIsModalOpen(false);
};
// const getWeekRange = (dateStr: Date): { start: string; end: string } => {
//   const date = new Date(dateStr);
//   const dayOfWeek = date.getDay(); // 0 = Sunday
//   const sunday = new Date(date);
//   sunday.setDate(date.getDate() - dayOfWeek);
//   const saturday = new Date(sunday);
//   saturday.setDate(sunday.getDate() + 6);
//   const toISO = (d: Date) => d.toISOString().split("T")[0];
//   return {
//     start: toISO(sunday),
//     end: toISO(saturday)
//   };
// };
//   const getReportsInRange = (startDate: string, endDate: string,reportData: TimeRecord[]) => {
//   const start = new Date(startDate);
//   const end = new Date(endDate);

//   return reportData.filter((report) => {
//     const filterReportDate = new Date(report.date);
//     return filterReportDate >= start && filterReportDate <= end;
//   });
// };
  // Reset form when closing modal
  const closeModal = () => {
     if (error) {
    alert("לא ניתן לסגור את הטופס כל עוד קיימת שגיאה. אנא תקן/י את השדות.");
    return;
  }
    setTypeReport(typeReports.find((t) => t.id === 5)|| null)
    setIsModalOpen(false)
     //initNewReport()
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
 
  // Get report type styling
//   useEffect(() => {
//   const handleClickOutside = (event: MouseEvent) => {
//     if (
//       contextMenuRowId !== null &&
//       rowRef.current &&
//       !rowRef.current.contains(event.target as Node)
//     ) {
//       setContextMenuRowId(null);
//     }
//   };

//   document.addEventListener("mousedown", handleClickOutside);
//   return () => {
//     document.removeEventListener("mousedown", handleClickOutside);
//   };
// }, [contextMenuRowId]);
useEffect(() => {
  const permisionEmployee = authService.getCurrentEmployee();
  if (permisionEmployee) {
    setEditPermision(permisionEmployee.editPermision);
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
        console.log('storedTimeRecord')
      
        console.log(storedTimeRecord)

        setReports(storedTimeRecord ?? []);
        initNewReport()
    } catch (error) {
      console.error('Failed to fetch time records:', error);
      setReports([]);
    }
  };

   fetchData();
//  const storedTimeRecord = timeRecordService.getTimeRecordsData(currentWeek);
//  setReports(storedTimeRecord)
  // filterReport(currentWeek, reports);//reports ,
}, [currentWeek]);

useEffect(() => {
  filterReport( reports);//currentWeek,
}, [reports]);
useEffect(() => {
    const json = localStorage.getItem("timeHourReportsTypes");
    if (json) {
      try {
        const list: TimeHourReportsType[] = JSON.parse(json);
        setTypeReports(list);
        setTypeReport(list.find((item) =>item.id==5)||null)
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
    const updateReport=reports.find(report => report.id === id);
    setNewReport({
      date: updateReport ? updateReport.date : new Date(),
      type: updateReport?updateReport.type:TimeType.Regular,
      typeID:5,
      clockInTime: updateReport?updateReport.clockInTime:'',
      clockOutTime:updateReport?updateReport.clockOutTime:'',
      notes: updateReport?updateReport.notes:''
    });
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
  // function setHousrForFreeDay() {
 
  //   if(employee?.minutesHoursAmount){
  //     const calculateclockOutTime=addTime("08:00",employee.minutesHoursAmount)
  //     setNewReport({...newReport, clockInTime: "08:00",clockOutTime:calculateclockOutTime})
  // }
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
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
        {editPermision &&(
        <div className="mb-6">
          <button
            onClick={() => {setError(null)
                            initNewReport()
                            setIsModalOpen(true)
                            console.log("newReport", newReport)
                            setModalTitle('הוספת דיווח חדש')
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

    // onContextMenu={(e) => {
    //   e.preventDefault(); // prevent default context menu
    //   setContextMenuRowId(report.id ?? null);
    // }}
    className={`relative grid grid-cols-5 gap-1 md:gap-4 p-3 md:p-4 hover:bg-gray-50 transition-colors duration-200 ${
      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
    }`}
              >
                {/* Date */}
                <div className="text-center text-xs md:text-base">
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
                <div className="text-center">
                  <span className={`inline-block px-1 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium border ${getReportTypeStyle(report.typeID)}`}>
                    <span className="block md:hidden">
                      {report.typeID === 5 ? 'ר' : 
                       report.typeID ===3? 'ח' ://"חופש"
                       report.typeID ===6 ? 'ב' ://"עבודה מהבית"
                       report.typeID ==4 ? 'מ' ://"מילואים"
                       report.typeID ==2? 'ת' ://"העדרות בתשלום" 
                       report.typeID ==1 ? 'מח' ://"מחלה"
typeReports.find((type) => (type.id===report.typeID))?.name
    // <option key={type.id} value={type.id}>
    //   {type.name}
    // </option>report.type
                        }
                    </span>
                    <span className="hidden md:block">{typeReports.find((type) => (type.id===report.typeID))?.name}</span>
                  </span>
                </div>
                
                {/* clockInTime Time */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-green-500 hidden md:block" />
                    <span className={`font-mono text-xs md:text-base ${report.clockInTime === '-' ? 'text-gray-400' : 'text-green-600 font-semibold'}`}>
                      {report.clockInTime}
                    </span>
                  </div>
                </div>
                
                {/* clockOutTime Time */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-red-500 hidden md:block" />
                    <span className={`font-mono text-xs md:text-base ${report.clockOutTime === '-' ? 'text-gray-400' : 'text-red-600 font-semibold'}`}>
                      {report.clockOutTime}
                    </span>
                  </div>
                </div>
                
                {/* Total Hours */}
                <div className="text-center">
                  <span className={`font-mono text-xs md:text-base font-bold px-1 md:px-2 py-1 rounded-lg ${
                    report.total === '00:00' 
                      ? 'text-gray-400 bg-gray-100' 
                      : 'text-blue-600 bg-blue-100'
                  }`}>
                {report.total === 'NaN:NaN' ? '00:00' : report.total}
                  </span>
                </div>
              {contextMenuRowId === -900&& (//report.id 
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
        if (report.id !== undefined){
          setModalTitle('עדכון דיווח מתאריך: '+report.date );
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
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/10 backdrop-blur-sm">
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

      {/* Modal for Adding New Report */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold"> {modalTitle} </h3>
           
                <button
                  onClick={closeModal}
                 className="w-8 h-8 rounded-full hover:bg-green-400 text-white flex items-center justify-center transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Date Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  תאריך הדיווח
                </label>
                <input
                  type="date"
                  value={newReport.date ? newReport.date.toISOString().split("T")[0] : ""}
                  onChange={(e) => setNewReport({...newReport, date: new Date(e.target.value)})}
                  className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  סוג הדיווח
                </label>
        <select
  className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
  value={typeReport?.id || ""}
  onChange={(e) => {
    const selectedId = Number(e.target.value);
    const selected = typeReports.find((t) => t.id === selectedId) || null;
    setTypeReport(selected);
    //setHousrForFreeDay();
  }}
>
  {typeReports.map((type) => (
    <option key={type.id} value={type.id}>
      {type.name}
    </option>
  ))}
</select>
                
              </div>

              {/* clockInTime and clockOutTime Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    שעת כניסה
                  </label>
                  <input
                    type="time"
                    value={newReport.clockInTime}
                    onChange={(e) => setNewReport({...newReport, clockInTime: e.target.value})}
                     onBlur={() =>{
                       if (newReport.clockInTime && newReport.clockOutTime) {
                   validateTimes(newReport.clockInTime, newReport.clockOutTime)}
                    }
                  }
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    disabled={newReport.typeID === 3}
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
            setNewReport({...newReport, clockOutTime: e.target.value})}
          onBlur={() =>{
            if (newReport.clockInTime && newReport.clockOutTime) {
           validateTimes(newReport.clockInTime, newReport.clockOutTime)}
            }
          }
                className={`text-black w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                  error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                } focus:border-transparent`}
                // disabled={newReport.type === 'חופש'}
                                />
                 {error && <p className="text-red-600 text-sm">{error}</p>}
                </div>
              </div>

              {/* Total Hours Display */}
              {newReport.clockInTime && newReport.clockOutTime && newReport.typeID !== 3 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    סה"כ שעות
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg font-mono text-lg font-bold text-blue-600">
                    {calculateTotalHours(newReport.clockInTime, newReport.clockOutTime)}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  הערות
                </label>
                <textarea
                
                  value={newReport.notes}
                  onChange={(e) => setNewReport({...newReport, notes: e.target.value})}
                  className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="הערות נוספות (אופציונלי)"
                />
              </div>

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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportList;