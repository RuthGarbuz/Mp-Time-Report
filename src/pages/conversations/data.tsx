import React, { useEffect, useState } from "react";
import { Calendar, Clock, User, X } from "lucide-react";
import type { Conversation } from "../../interface/ConversationModel";



//type Employee = { id: number; name: string };

type TaskModalProps = {
    isOpen: boolean;
    editingId: number;
   callObject: Conversation | null;
  onClose: () => void;

};

const ConversationModalOpen: React.FC<TaskModalProps> = ({
  callObject,
onClose,
    isOpen,
    editingId,
}) => {
    if (!isOpen) return null;

            const [selectedCall, setselectedCall] = useState<Conversation | null>(null);
    const [title, setTitle] = useState('');

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setselectedCall(callObject);
                if (editingId) {
                    //  const empName = employeesList.find(emp => emp.id === callObject.recipientID);
                    //  setSearchEmployee(empName?.name ?? "");
                    setTitle("עריכת שיחה")
                }
                else {
                    setTitle("הוספת שיחה חדשה")

                }
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };
        fetchData();
    }, []);
     if (!isOpen && !selectedCall) return null;

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
   
        {/* Content */}
        {/* <div className="p-4 sm:p-6 space-y-4 sm:space-y-5"> */}
          {/* Title */}
          <div>
            <label className="block text-right text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 font-semibold">
              תיאור השיחה
            </label>
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <input
                type="text"
                placeholder="הכנס תיאור קצר לשיחה..."
                defaultValue={selectedCall?.subject}
                className="w-full text-right bg-transparent outline-none text-gray-800 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Contact Name */}
          <div>
            <label className="block text-right text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 font-semibold">
              שם איש קשר
            </label>
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center justify-between">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="-נושאשם מלא"
                defaultValue={selectedCall?.subject}
                className="flex-1 text-right bg-transparent outline-none text-gray-800 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-right text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 font-semibold">
              תאריך השיחה
            </label>
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center justify-between">
              <Calendar size={18} className="text-gray-400" />
              <input
                                    type="date"
                                    value={ selectedCall?.startDate
    ? new Date(selectedCall?.startDate).toLocaleDateString('he-IL')
    : ''}
                                    //onChange={(e) => {
                                      //  const newStartDate = e.target.value;
                                        // setselectedCall((prev) => {
                                        //     let updated = { ...prev, startDate: newStartDate };
                                        //     // if start date is after end date -> fix end date
                                        //     if (prev.dueDate && new Date(newStartDate) > new Date(prev.dueDate)) {
                                        //         updated.dueDate = newStartDate;
                                        //     }
                                        //     return updated;
                                        // });
                                    //}}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
              <input
                type="text"
                placeholder="DD.MM.YYYY"
                defaultValue={
                  selectedCall?.startDate
    ? new Date(selectedCall?.startDate).toLocaleDateString('he-IL')
    : ''
                }
                className="flex-1 text-right bg-transparent outline-none text-gray-800 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-right text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 font-semibold">
                שעת סיום
              </label>
              <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center justify-between">
                <Clock size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="10:00"
                  defaultValue={
            selectedCall?.dueDate
    ? new Date(selectedCall.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''
                  }
                  className="flex-1 text-right bg-transparent outline-none text-gray-800 text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-right text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 font-semibold">
                שעת התחלה
              </label>
              <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center justify-between">
                <Clock size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="09:00"
                  defaultValue={
                                         selectedCall?.startDate
    ? new Date(selectedCall.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''
                  }
                  className="flex-1 text-right bg-transparent outline-none text-gray-800 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-right text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 font-semibold">
              משך השיחה
            </label>
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
              <input
                type="text"
                placeholder="0 דקות"
               // defaultValue={selectedCall?.duration}
                className="w-full text-right bg-transparent outline-none text-gray-800 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-right text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 font-semibold">
              הערות
            </label>
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
              <textarea
                placeholder="הוסף הערות נוספות..."
                //defaultValue={selectedCall?.notes}
                rows={4}
                className="w-full text-right bg-transparent outline-none text-gray-800 text-xs sm:text-sm resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
           
            <button
              onClick={onClose}
              className="py-3 sm:py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition text-sm sm:text-base"
            >
              ביטול
            </button>
             <button className="py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold hover:shadow-xl transition text-sm sm:text-base">
              {selectedCall ? 'עדכן' : 'שמור'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationModalOpen;