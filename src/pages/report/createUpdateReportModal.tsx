// ReportModal.tsx
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import ErrorMessage from "../shared/errorMessage";

interface ReportModalProps {
  isOpen: boolean;
  title: string;
  newReport: any;
  setNewReport: (data: any) => void;
  typeReports: any[];
  closeModal: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  currentWeek: Date;
    errorMessage:string | null;
}

export default function ReportModal({
  isOpen,
  title,
  newReport,
  setNewReport,
  typeReports,
  closeModal,
  handleSubmit,
  currentWeek,
  errorMessage
}: ReportModalProps) {
    const [error, setError] = useState<string | null>(null);
  if (!isOpen) return null;
   const validateTimes = (clockInTime: string, clockOutTime: string) => {
    if (clockInTime && clockOutTime && clockOutTime < clockInTime) {
      setError("שעת יציאה לא יכולה להיות לפני שעת כניסה");
    } else {
      setError(null);
    }
  };
  const calculateTotalHours = (clockInTime: string, clockOutTime: string) => {
    if (clockInTime === '-' || clockOutTime === '-') return '00:00';

    const clockInTimeMinutes = timeToMinutes(clockInTime);
    const clockOutTimeMinutes = timeToMinutes(clockOutTime);
    const totalMinutes = clockOutTimeMinutes - clockInTimeMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const total = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return total;
  };
   const onClose = () => {
    if (error) {
      alert("לא ניתן לסגור את הטופס כל עוד קיימת שגיאה. אנא תקן/י את השדות.");
      return;
    }
    closeModal();
  };
  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault(); 
      
    if(error){
      alert("לא ניתן לסגור את הטופס כל עוד קיימת שגיאה. אנא תקן/י את השדות.");
      return;
    }
    
  handleSubmit(e);
}
const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const getWeekRange = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay(); // 0 = Sunday, 1 = Monday, etc.
  start.setDate(start.getDate() - day); // go back to Sunday (or adjust if Monday-based)
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Saturday
  return { start, end };
};
    const { start, end } = getWeekRange(currentWeek);


useEffect(() => {
  console.log("newReport", newReport);
  if (newReport.clockInTime && newReport.clockOutTime && newReport.typeID !== 3) {
    const total = calculateTotalHours(newReport.clockInTime, newReport.clockOutTime);
    setNewReport((prev: any) => ({ ...prev, total }));
  }
}, [newReport.clockInTime, newReport.clockOutTime, newReport.typeID]);
  return (
   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
               {/* Header */}
               <div className="relative pt-1 flex items-center justify-center mb-2">
                 <h2 className="text-lg font-semibold text-gray-800 text-center">{title}</h2>
                 <button
                   onClick={onClose}
                   className="absolute left-0  w-8 h-8 flex items-center justify-center"
                 >
                   <X className="w-5 h-5 text-gray-500" />
                 </button>
   
               </div>
               {/* Scrollable body */}
               <div className="p-4 space-y-3 overflow-y-auto">
   
   
                 {/* Modal Content */}
                 <form onSubmit={submitForm} >
                      {errorMessage&&(<ErrorMessage validateError={String(errorMessage)} />)}
                   {/* Date Field */}
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">
                       תאריך הדיווח
                     </label>
                     <input
                       type="date"
                       value={newReport.date ? newReport.date : ""}
                       onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
                       min={start.toISOString().split("T")[0]}
                       max={end.toISOString().split("T")[0]}
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
                        value={newReport.typeID || ""}
                       onChange={(e) => {
                         const selectedId = Number(e.target.value);
                         setNewReport({ ...newReport, typeID: selectedId })
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
                         onChange={(e) => setNewReport({ ...newReport, clockInTime: e.target.value })}
                         onBlur={() => {
                           if (newReport.clockInTime && newReport.clockOutTime) {
                             validateTimes(newReport.clockInTime, newReport.clockOutTime)
                           }
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
   
                   {/* Total Hours Display */}
                   {newReport.clockInTime && newReport.clockOutTime && newReport.typeID !== 3 && (
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         סה"כ שעות
                       </label>
                       <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg  text-lg font-bold text-blue-600">
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
                       onChange={(e) => setNewReport({ ...newReport, notes: e.target.value })}
                       className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                       rows={3}
                       placeholder="הערות נוספות (אופציונלי)"
                     />
                   </div>
   
                   {/* Submit Buttons */}
                   <div className="flex gap-3 pt-4">
   
                     <button
                       type="button"
                       onClick={onClose}
                       className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                     >
                       ביטול
                     </button>
                     <button
                       type="submit"
                       className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       שמור דיווח
                     </button>
                   </div>
                 </form>
               </div>
             </div>
           </div>
  );
}
