import { X } from "lucide-react";
import type { Contract, Project, Step, SubContract } from "../../interface/interfaces";

interface Props {
 isOpen: boolean;
  onClose: () => void;
  newReport: any;
  setNewReport: (report: any) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  setError: (value: string | null) => void; // ⬅️ תוספת
  reportingType: string;
  changeReportingType: (type: string) => void;
  contracs: Contract[] | null;
  subContracts: SubContract[] | null;
  steps: Step[] | null;
  selectedProject?: Project;
  currentDay: Date;
  calculateclockOutTime: () => string;
}

export default function HourReportModalOpen({
  isOpen,
  onClose,
  newReport,
  setNewReport,
  handleSubmit,
  error,
  setError,
  reportingType,
  changeReportingType,
  contracs,
  subContracts,
  steps,
  selectedProject,
  currentDay,
  calculateclockOutTime
}: Props) {
  if (!isOpen) return null;
  const validateTimes = (clockInTime: string, clockOutTime: string) => {
    if (clockInTime && clockOutTime && clockOutTime < clockInTime) {
      setError("שעת יציאה לא יכולה להיות לפני שעת כניסה");
    } else {
      setError(null);
    }
  };
    const closeModal = () => {
    if (error) {
      alert("לא ניתן לסגור את הטופס כל עוד קיימת שגיאה. אנא תקן/י את השדות.");
      return;
    }
    onClose()
   // setIsModalOpen(false)
  };
  const reportingTypeChange=(type:string)=>{
changeReportingType(type)
if(type=='total'){
  setNewReport({...newReport, clockInTime:undefined,clockOutTime:undefined })
}
else{
setNewReport((prev: any) => ({
      ...prev,
      clockInTime: "08:00",
      clockOutTime: typeof calculateclockOutTime === 'function' 
                      ? calculateclockOutTime() 
                      : calculateclockOutTime
    }));
}
}
  return (
    <div className="text-gray-800 fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
             <div className="p-4">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-gray-800"> דיווח שעות לפרויקט</h2>
                 <button
                   onClick={() => onClose()}
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
                      className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
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
                         onChange={() => reportingTypeChange('time-range')}
                         className="ml-2 text-blue-500"
                       />
                       <span className="text-sm">משעה עד שעה</span>
                     </label>
                     
                     <label className="flex items-center">
                       <input
                         type="checkbox"
                         checked={reportingType === 'total'}
                         onChange={() => reportingTypeChange('total')}
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
                   type="button"
                   onClick={closeModal}
                    className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                 >
                   ביטול
                 </button> 
                 <button
                   type="submit"
                   // onClick={() => setIsModalOpen(false)}
                   className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   שמור דיווח
                 </button>
               </div>
               </div>
               </form>
             </div>
           </div>
         </div>
  );
}