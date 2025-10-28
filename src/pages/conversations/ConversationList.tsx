import React, { useEffect, useState } from 'react';

import {  Edit2, Trash2, Clock, Plus } from 'lucide-react';
import EmployeeProfileCard from '../shared/employeeProfileCard';
import type { Conversation, Employee } from '../../interface/interfaces';
import timeRecordService from '../../services/timeRecordService';
import { getConversationList } from '../../services/phoneBookService';
import ConversationModalOpen from './conversationModalOpen';

 

const ConversationList: React.FC = () => {

  const [selectedCall, setSelectedCall] = useState<Conversation | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);

  const [callEntries, setCallEntries] = useState<Conversation[]>([]);
 

//   const callEntries: CallEntry[] = [

//     {

//       id: '1',

//       title: 'aaa',

//       contactName: 'מעיין סוסי',

//       date: '22.10.2025',

//       startTime: '09:00',

//       endTime: '10:00',

//       duration: '0',

//       notes: 'שיחה עם לקוח חשוב'

//     },

//     {

//       id: '2',

//       title: 'aaaa',

//       contactName: 'מעיין סוסי',

//       date: '22.10.2025',

//       startTime: '09:00',

//       endTime: '10:00',

//       duration: '0',

//       notes: 'תכנון פרויקט חדש'

//     },

//     {

//       id: '3',

//       title: 'ddddddddddd',

//       contactName: 'מעיין סוסי',

//       date: '22.10.2025',

//       startTime: '09:00',

//       endTime: '10:00',

//       duration: '0',

//       notes: 'מעקב אחר משימות'

//     }

//   ];
useEffect(() => {
    const fetchData = async () => {
      const conversationData = await getConversationList();
     
      if (conversationData) {
        setCallEntries(conversationData);
      }
      else {setCallEntries([]);}
    };
    fetchData();
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

  }, []);
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
function calculateDuration(startDate: Date, endDate: Date): string {
  // Get only the time parts in local hours and minutes
  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
  const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

  // Calculate the difference (if end < start, assume same day so duration = 0)
  let diffMinutes = endMinutes - startMinutes;
  if (diffMinutes < 0) diffMinutes += 24 * 60; // handle if end time passes midnight

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  // Format hh:mm
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
}

  return (
<div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
    {/* <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 mb-4 max-w-4xl mx-auto"> */}
       
        <EmployeeProfileCard
          employee={employee}
        ></EmployeeProfileCard>

        {/* Add Button */}

        {/* <button
          onClick={() => setShowAddModal(true)}
          className="w-full mb-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold hover:shadow-xl transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>הוסף דיווח חדש</span>
        </button> */}


 

      {/* Call Diary List Card */}

      <div className="bg-white rounded-3xl shadow-2xl p-6 ">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">יומן שיחות שלי</h2>
          <Clock className="text-purple-600 w-6 h-6" />
        </div>

 

        {/* Call Entries */}

       <div className="space-y-3">
  {callEntries.map((call, index) => (
    <div
      key={index}
      onClick={() => setSelectedCall(call)}
      className="flex items-start gap-3 p-4 border rounded-2xl transition-all bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm cursor-pointer"
    >
      {/* Checkbox */}
      <div className="w-6 h-6 border-2 border-gray-300 rounded-lg flex-shrink-0 mt-1"></div>

      {/* Call Info */}
      <div className="flex-1">
        <div className="font-medium mb-1 text-gray-800">{call.subject}</div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
         
  <span>
  {call.startDate
    ? new Date(call.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''}
  {' - '}
  {call.dueDate
    ? new Date(call.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''}
</span>
<span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
{calculateDuration(new Date(call.startDate), new Date(call.dueDate))}</span>
<span>
  {call.startDate
    ? new Date(call.startDate).toLocaleDateString('he-IL')
    : ''}
</span>
        </div>
      </div>
 {/* <span>{call.startDate instanceof Date ? call.startDate.toLocaleDateString() : String(call.startDate ?? '')}</span> */}
          {/* <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
            {call.duration}
          </span> */}
          {/* <span>{(call.startDate instanceof Date ? call.startDate.toLocaleDateString() : String(call.startDate ?? ''))} - {(call.dueDate instanceof Date ? call.dueDate.toLocaleDateString() : String(call.dueDate ?? ''))}</span> */}
      {/* Action Buttons */}
      <div className="flex gap-1 flex-shrink-0">
        <button className="pl-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
        <button className="pr-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors">
          <Edit2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  ))}
</div>

      </div>

 

      {/* Add/Edit Modal */}

      {(showAddModal || selectedCall) && (
        <ConversationModalOpen
          isOpen={showAddModal || selectedCall !== null}
          onClose={() => {  setShowAddModal(false); setSelectedCall(null); } }
          callObject={selectedCall}
            editingId={selectedCall ? selectedCall.id : 0}
        />

      )}
<div className="fixed bottom-20 right-6 z-40 group">
        <button

          onClick={() => {
            setShowAddModal(true)
          }}
          className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-6 h-6" />
        </button>
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          הוסף שיחה חדשה
        </span>
      </div>
    </div>
      </div>

  );

};

 

export default ConversationList;