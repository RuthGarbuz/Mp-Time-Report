import { X } from "lucide-react";
import type { Contract, Project, Step, SubContract } from "../../interface/interfaces";
import { useState } from "react";
import ErrorMessage from "../shared/errorMessage";

interface Props {
 isOpen: boolean;
  onClose: () => void;
  newReport: any;
  setNewReport: (report: any) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  contracts: Contract[] | null;
  subContracts: SubContract[] | null;
  steps: Step[] | null;
  selectedProject?: Project;
  currentDay: Date;
  calculateclockOutTime: () => string;
  errorMessage:string | null;
}

export default function HourReportModalOpen({
  isOpen,
  onClose,
  newReport,
  setNewReport,
  handleSubmit,
  contracts,
  subContracts,
  steps,
  selectedProject,
  currentDay,
  errorMessage,
  calculateclockOutTime
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [reportingType,setReportingType]=useState('time-range');
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
  const changeReportingType=(type:string)=>{
//changeReportingType(type)
setReportingType(type);
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
const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault(); 
      if (reportingType==='time-range' &&(!newReport.clockInTime || !newReport.clockOutTime)) {
       setError("שעת כניסה ושעת יציאה חייבות להיות מוגדרות");
       return;
    }
    if(error){
      return;
    }
    
  handleSubmit(e);
}
  return (
    <div className="text-gray-800 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="relative pt-1 flex items-center justify-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800 text-center"> דיווח שעות לפרויקט</h2>
                  <button
                    onClick={() => onClose()}
                    className="absolute left-0  w-8 h-8 flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                 
                </div>
                {/* Scrollable body */}
                <div className="p-4 space-y-3 overflow-y-auto">
    
              
                    <form onSubmit={submitForm} className="2 space-y-2">
                      {errorMessage&&(<ErrorMessage validateError={String(errorMessage)} />)}
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
                          onChange={() => setNewReport({...newReport, projectID:selectedProject?.id ?? 0 })}
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
                            onChange={() =>{setError(null), changeReportingType('time-range')}}
                            className="ml-2 text-blue-500"
                          />
                          <span className="text-sm">משעה עד שעה</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={reportingType === 'total'}
                            onChange={() => { setError(null), changeReportingType('total') }}
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
                  {contracts && (
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
                        {contracts?.map(contract => (
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
                      className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                    >
                      ביטול
                    </button>
                    <button
                      type="submit"
                      // onClick={() => setIsModalOpen(false)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
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