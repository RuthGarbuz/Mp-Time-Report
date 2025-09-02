// import React, { useState } from 'react';

// import { Clock, Plus, ChevronDown, Edit, Trash2 } from 'lucide-react';

 

// const MeetingsManager = () => {

//   const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'

 

//   // דמי נתונים לפגישות שקיבלתי

//   const receivedMeetings = [

//     {

//       id: 1,

//       title: "מפגש משרד משירד לדוגמה העובד אוידי קשה טלפון 052-4595827",

//       description: "תיאור הפגיעה לא מצליחה לחתוך את השכבות לא יודעת למה זקוקה לעזרה",

//       date: "26.8.2025",

//       time: "13:39 - 13:39",

//       status: "ממתין"

//     },

//     {

//       id: 2,

//       title: "פגישה עם לקוח חשוב",

//       description: "דיון על פרויקט חדש ואפשרויות שיתוף פעולה",

//       date: "27.8.2025",

//       time: "11:05 - 11:05",

//       status: "אושר"

//     }

//   ];

 

//   // דמי נתונים לפגישות ששלחתי

//   const sentMeetings = [

//     {

//       id: 1,

//       title: "פגישת צוות שבועית",

//       description: "סקירת התקדמות פרויקטים ותכנון השבוע הבא",

//       date: "28.8.2025",

//       time: "09:00 - 10:00",

//       status: "ממתין לאישור"

//     },

//     {

//       id: 2,

//       title: "פגישה עם ספק חדש",

//       description: "הצגת מוצרים ומחירים למחצית השנה",

//       date: "29.8.2025",

//       time: "14:30 - 15:30",

//       status: "נדחה"

//     }

//   ];

 

//   const getCurrentMeetings = () => {

//     return activeTab === 'received' ? receivedMeetings : sentMeetings;

//   };

 

//   const getStatusColor = (status:any) => {

//     switch(status) {

//       case 'ממתין': return 'text-yellow-600';

//       case 'ממתין לאישור': return 'text-yellow-600';

//       case 'אושר': return 'text-green-600';

//       case 'נדחה': return 'text-red-600';

//       default: return 'text-gray-600';

//     }

//   };

 

//   const currentMeetings = getCurrentMeetings();

//   const completedCount = currentMeetings.filter(m => m.status === 'אושר').length;

//   const waitingCount = currentMeetings.filter(m => m.status === 'ממתין' || m.status === 'ממתין לאישור').length;

//   const totalCount = currentMeetings.length;

 

//   return (

//     <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-4" dir="rtl">

//       {/* Header */}

//       <div className="bg-purple-600 text-white p-4 rounded-t-lg">

//         <div className="flex justify-between items-center">

//           <div className="flex space-x-6 space-x-reverse">

//             <span>משימות</span>

//             <span>אלכון</span>

//             <span>דיווח נכחות</span>

//             <span>רשימת דיוורים</span>

//             <span>התחבר</span>

//           </div>

//           <div className="text-xl font-bold">משימות נכחות 📊</div>

//         </div>

//       </div>

 

//       <div className="max-w-4xl mx-auto mt-6 space-y-6">

//         {/* Main Card */}

//         <div className="bg-white rounded-lg shadow-lg p-6">

//           {/* Tab Header */}

//           <div className="flex mb-6 bg-gray-100 rounded-lg p-1">

//             <button

//               onClick={() => setActiveTab('received')}

//               className={`flex-1 py-2 px-4 text-center rounded-md font-medium transition-all ${

//                 activeTab === 'received'

//                   ? 'bg-white text-purple-600 shadow-sm'

//                   : 'text-gray-600 hover:text-purple-600'

//               }`}

//             >

//               פגישות שקיבלתי

//             </button>

//             <button

//               onClick={() => setActiveTab('sent')}

//               className={`flex-1 py-2 px-4 text-center rounded-md font-medium transition-all ${

//                 activeTab === 'sent'

//                   ? 'bg-white text-purple-600 shadow-sm'

//                   : 'text-gray-600 hover:text-purple-600'

//               }`}

//             >

//               פגישות ששלחתי

//             </button>

//           </div>

 

//           {/* Status Header */}

//           <div className="flex justify-between items-center mb-6">

//             <div className="text-sm text-gray-500">

//               27.8.2025<br/>13:08:51

//             </div>

//             <h2 className="text-xl font-bold text-gray-800">

//               {activeTab === 'received' ? 'התקדמות הפגישות שקיבלתי' : 'התקדמות הפגישות ששלחתי'}

//             </h2>

//           </div>

 

//           {/* Progress Circle */}

//           <div className="flex flex-col items-center mb-8">

//             <div className="relative w-32 h-32 mb-4">

//               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">

//                 <circle

//                   cx="50"

//                   cy="50"

//                   r="40"

//                   stroke="#e5e7eb"

//                   strokeWidth="8"

//                   fill="transparent"

//                 />

//                 <circle

//                   cx="50"

//                   cy="50"

//                   r="40"

//                   stroke="#8b5cf6"

//                   strokeWidth="8"

//                   fill="transparent"

//                   strokeDasharray={`${(completedCount / totalCount) * 251.2} 251.2`}

//                   strokeLinecap="round"

//                 />

//               </svg>

//               <div className="absolute inset-0 flex flex-col items-center justify-center">

//                 <span className="text-3xl font-bold text-purple-600">

//                   {Math.round((completedCount / totalCount) * 100)}%

//                 </span>

//                 <span className="text-sm text-gray-500">הושלם</span>

//               </div>

//             </div>

 

//             {/* Action Buttons */}

//             <div className="flex gap-4 w-full mb-6">

//               <button className="flex-1 bg-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-600 transition-colors">

//                 {activeTab === 'received' ? 'להשיב' : 'לשלוח פגישה'}

//               </button>

//               <button className="px-6 py-3 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">

//                 לדחות

//               </button>

//             </div>

 

//             {/* Add/Filter Section */}

//              </div>
//               </div>
//                </div>
//                 </div>)