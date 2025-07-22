// import React from 'react';
// import type { Contact } from '../interface/interfaces';


// type Props = {
//   contacts: Contact[];
// };

// export const PhonebookGrid: React.FC<Props> = ({ contacts }) => {
//  return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden" >
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-800 to-purple-500 text-white p-4">
//         <h3 className="text-xl md:text-2xl font-bold mb-3 text-right">רשימת אנשי קשר</h3>
//         <div className="grid grid-cols-4 md:grid-cols-6 gap-2 text-base md:text-lg font-semibold">
//           <div className="text-right">חברה</div>
//           <div className="text-right">איש קשר</div>
//           <div className="text-right">נייד</div>
//           <div className="text-right">אימייל</div>
//           <div className="text-right hidden md:block">טלפון</div>
//           <div className="text-right hidden md:block">כתובת</div>
//         </div>
//       </div>

//       {/* Content */}
      
//       <div className="divide-y divide-gray-100">
//         {/* {contacts.length === 0 ? (
//   <div className="p-4 text-gray-500 text-center">לא נמצאו אנשי קשר</div>
// ) : (
// <div className="p-4 text-gray-500 text-center"> נמצאו</div>// your grid rows
// )} */}
//         {contacts.map((item, index) => (
//           <div
//             key={item.id}
//             className={`text-gray-800 grid grid-cols-4 md:grid-cols-6 gap-2 text-base md:text-lg p-3 md:p-4 transition-colors duration-150
            
//             `}
//           >
//             <div className="text-right">{item.company}</div>
//             <div className="text-right">{item.contact}</div>
//             <div className="text-right">{item.cellPhone}</div>
//             <div className="text-right">{item.email}</div>
//             <div className="text-right hidden md:block">{item.phone || '-'}</div>
//             <div className="text-right hidden md:block">{item.address || '-'}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//       </div>
//   );
// };
import React, { useState, useEffect } from 'react';
import type { Contact, PhoneBook } from '../interface/interfaces';
import { getPhoneBookList } from '../services/phoneBookService';
//import { debounce } from 'lodash';


type Props = {
  contacts: Contact[];
};

const highlightMatch = (text: string, query: string) => {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.split(regex).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 font-bold">{part}</mark>
    ) : (
      part
    )
  );
};

export const PhonebookGrid: React.FC<Props> = ({  }) => {
  const [searchTerm, setSearchTerm] = useState('');
 const [phoneBooks, setPhoneBooks] = useState<PhoneBook[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPhoneBookList();
      setPhoneBooks(data);
    };

    fetchData();
  }, []);

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchTerm(e.target.value);
};
  const handleClearSearch = () => {
    setSearchTerm('');
    //setDebouncedSearch('');
  };

  // const filteredContacts = useMemo(() => {
  //   const q = searchTerm.toLowerCase();
  //   if (!q) return contacts;

  //   return contacts.filter((c) =>
  //     [c.company, c.contact, c.cellPhone, c.email, c.phone, c.address]
  //       .filter(Boolean)
  //       .some((field) => field?.toLowerCase().includes(q))
  //   );
  // }, [contacts, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">

        {/* 🔍 Search */}
        <div className="relative w-full md:w-1/2  p-4 bg-gray-20 border-b border-gray-300">
  <input
    type="text"
    placeholder="חפש לפי חברה, איש קשר, טלפון..."
    value={searchTerm}
    onChange={handleInputChange}
    className="text-gray-500 w-full p-2 pl-10 pr-2 border border-gray-300 rounded-lg text-right text-base focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400"
  />

  {/* זכוכית מגדלת כשאין טקסט */}
  {!searchTerm && (
    <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
      🔍
    </span>
  )}

  {/* כפתור X כשיש טקסט */}
  {searchTerm && (
    <button
      onClick={handleClearSearch}
      className="absolute left-5 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 text-lg"
    >
      ✖
    </button>
  )}
</div>
        {/* <div className="p-4 bg-gray-100 border-b border-gray-300 flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <input
            type="text"
            placeholder="חפש לפי חברה, איש קשר, טלפון..."
            value={searchTerm}
            onChange={handleInputChange}
            className="text-gray-500 w-full md:w-1/2 p-2 border border-gray-300 rounded-lg text-right text-base focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="text-sm text-red-500 hover:underline"
            >
              נקה חיפוש ✖
            </button>
          )}
        </div> */}

        {/* 🧾 Header */}
        <div className="bg-gradient-to-r from-blue-800 to-purple-500 text-white p-4">
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-right">רשימת אנשי קשר</h3>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 text-base md:text-lg font-semibold">
            <div className="text-right">חברה</div>
            <div className="text-right">איש קשר</div>
            <div className="text-right">נייד</div>
            <div className="text-right">אימייל</div>
            <div className="text-right hidden md:block">טלפון</div>
            <div className="text-right hidden md:block">כתובת</div>
          </div>
        </div>

        {/* 📋 Content */}
        <div className="divide-y divide-gray-100">
          {phoneBooks.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">לא נמצאו תוצאות</div>
          ) : (
            phoneBooks.map((item, index) => (
              <div
                key={item.id}
                className={`text-gray-800 grid grid-cols-4 md:grid-cols-6 gap-2 text-base md:text-lg p-3 md:p-4 transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="text-right">{highlightMatch(item.name, searchTerm)}</div>
                <div className="text-right">{highlightMatch(item.contact, searchTerm)}</div>
                <div className="text-right">{highlightMatch(item.contactCell, searchTerm)}</div>
                <div className="text-right">{highlightMatch(item.officeEmail, searchTerm)}</div>
                <div className="text-right hidden md:block">{highlightMatch(item.phoneNum || '-', searchTerm)}</div>
                <div className="text-right hidden md:block">{highlightMatch(item.addressName || '-', searchTerm)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

