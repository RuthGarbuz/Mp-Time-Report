// import React, { useState } from 'react';

// import { Phone, Edit3, Save, X, Mail, User } from 'lucide-react';

 

// const ContactModal = () => {

//   const [contacts, setContacts] = useState([

//     { id: 1, name: 'איילת כהן', company: 'cshev', number: '052-123-4567', email: 'ayelet@example.com' },

//     { id: 2, name: 'דני לוי', company: 'Tech Solutions', number: '054-987-6543', email: 'danny@example.com' },

//     { id: 3, name: 'מירי שמש', company: 'Marketing Pro', number: '050-555-1234', email: 'miri@example.com' }

//   ]);

 

//   const [selectedContact, setSelectedContact] = useState(null);

//   const [isEditing, setIsEditing] = useState(false);

//   const [editData, setEditData] = useState({});

 

//   const openContactView = (contact) => {

//     setSelectedContact(contact);

//     setIsEditing(false);

//     setEditData(contact);

//   };

 

//   const startEdit = () => {

//     setIsEditing(true);

//   };

 

//   const saveChanges = () => {

//     setContacts(contacts.map(contact =>

//       contact.id === selectedContact.id ? { ...editData } : contact

//     ));

//     setSelectedContact(editData);

//     setIsEditing(false);

//   };

 

//   const closeModal = () => {

//     setSelectedContact(null);

//     setIsEditing(false);

//   };

 

//   const handleInputChange = (field, value) => {

//     setEditData({ ...editData, [field]: value });

//   };

 

//   return (

//     <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500">

//       {/* Header */}

//       <div className="flex items-center justify-between p-4 text-white">

//         <div className="w-8 h-8 flex items-center justify-center">

//           <div className="space-y-1">

//             <div className="w-4 h-0.5 bg-white"></div>

//             <div className="w-4 h-0.5 bg-white"></div>

//             <div className="w-4 h-0.5 bg-white"></div>

//           </div>

//         </div>

//         <h1 className="text-lg font-medium">אנשי קשר</h1>

//         <div className="w-8 h-8"></div>

//       </div>

 

//       {/* Search Bar */}

//       <div className="px-4 pb-4">

//         <div className="bg-white bg-opacity-90 rounded-full px-4 py-3 flex items-center">

//           <div className="w-5 h-5 text-gray-400 ml-2">🔍</div>

//           <input

//             type="text"

//             placeholder="חפש לפי שם או חברה..."

//             className="flex-1 bg-transparent outline-none text-right text-gray-700"

//           />

//         </div>

//       </div>

 

//       {/* Contacts List */}

//       <div className="px-4 space-y-3">

//         {contacts.map(contact => (

//           <div

//             key={contact.id}

//             onClick={() => openContactView(contact)}

//             className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 flex items-center cursor-pointer hover:bg-opacity-30 transition-all"

//           >

//             <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center ml-4">

//               <Phone className="w-6 h-6 text-white" />

//             </div>

//             <div className="flex-1 text-right">

//               <div className="text-white font-medium text-lg">{contact.name}</div>

//               <div className="text-white text-opacity-80 text-sm">{contact.company}</div>

//               <div className="text-white text-opacity-60 text-sm">אין מספר</div>

//             </div>

//           </div>

//         ))}

//       </div>

 

//       {/* Contact Modal */}

//       {selectedContact && (

//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

//           <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">

//             {/* Modal Header */}

//             <div className="flex items-center justify-between mb-6">

//               <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center">

//                 <X className="w-5 h-5 text-gray-500" />

//               </button>

//               <h2 className="text-lg font-semibold text-gray-800">

//                 {isEditing ? 'עריכת איש קשר' : 'פרטי איש קשר'}

//               </h2>

//               <button

//                 onClick={isEditing ? saveChanges : startEdit}

//                 className="w-8 h-8 flex items-center justify-center"

//               >

//                 {isEditing ? (

//                   <Save className="w-5 h-5 text-blue-600" />

//                 ) : (

//                   <Edit3 className="w-5 h-5 text-gray-500" />

//                 )}

//               </button>

//             </div>

 

//             {/* Contact Details */}

//             <div className="space-y-6">

//               {/* Name */}

//               <div className="text-right">

//                 <label className="block text-sm font-medium text-gray-700 mb-2">

//                   <User className="w-4 h-4 inline ml-1" />

//                   שם פרטי

//                 </label>

//                 {isEditing ? (

//                   <input

//                     type="text"

//                     value={editData.name || ''}

//                     onChange={(e) => handleInputChange('name', e.target.value)}

//                     className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"

//                   />

//                 ) : (

//                   <div className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">

//                     {selectedContact.name}

//                   </div>

//                 )}

//               </div>

 

//               {/* Company */}

//               <div className="text-right">

//                 <label className="block text-sm font-medium text-gray-700 mb-2">חברה</label>

//                 {isEditing ? (

//                   <input

//                     type="text"

//                     value={editData.company || ''}

//                     onChange={(e) => handleInputChange('company', e.target.value)}

//                     className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"

//                   />

//                 ) : (

//                   <div className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">

//                     {selectedContact.company}

//                   </div>

//                 )}

//               </div>

 

//               {/* Phone */}

//               <div className="text-right">

//                 <label className="block text-sm font-medium text-gray-700 mb-2">

//                   <Phone className="w-4 h-4 inline ml-1" />

//                   טלפון נייד

//                 </label>

//                 {isEditing ? (

//                   <input

//                     type="tel"

//                     value={editData.number || ''}

//                     onChange={(e) => handleInputChange('number', e.target.value)}

//                     className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"

//                   />

//                 ) : (

//                   <div className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">

//                     {selectedContact.number}

//                   </div>

//                 )}

//               </div>

 

//               {/* Email */}

//               <div className="text-right">

//                 <label className="block text-sm font-medium text-gray-700 mb-2">

//                   <Mail className="w-4 h-4 inline ml-1" />

//                   אימייל

//                 </label>

//                 {isEditing ? (

//                   <input

//                     type="email"

//                     value={editData.email || ''}

//                     onChange={(e) => handleInputChange('email', e.target.value)}

//                     className="w-full p-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-purple-500 focus:border-transparent"

//                   />

//                 ) : (

//                   <div className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-left">

//                     {selectedContact.email}

//                   </div>

//                 )}

//               </div>

 

//               {/* Action Buttons */}

//               <div className="flex gap-3 pt-4">

//                 {isEditing ? (

//                   <>

//                     <button

//                       onClick={saveChanges}

//                       className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"

//                     >

//                       שמור שינויים

//                     </button>

//                     <button

//                       onClick={() => {

//                         setIsEditing(false);

//                         setEditData(selectedContact);

//                       }}

//                       className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"

//                     >

//                       ביטול

//                     </button>

//                   </>

//                 ) : (

//                   <>

//                     <button

//                       onClick={startEdit}

//                       className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"

//                     >

//                       <Edit3 className="w-4 h-4" />

//                       ערוך איש קשר

//                     </button>

//                     <button className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2">

//                       <Phone className="w-4 h-4" />

//                       התקשר

//                     </button>

//                   </>

//                 )}

//               </div>

//             </div>

//           </div>

//         </div>

//       )}

//     </div>

//   );

// };

 

// export default ContactModal;

 