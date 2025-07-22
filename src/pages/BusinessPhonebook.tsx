import  { useEffect, useRef, useState } from 'react';
import { Phone, Search,  Building, X } from 'lucide-react';
import { getPhoneBookList } from '../services/phoneBookService';
import type { PhoneBook } from '../interface/interfaces';

export default function BusinessPhonebook() {
    const [selectedContact, setSelectedContact] = useState<PhoneBook | null>(null);

    

    //   const [editingContact, setEditingContact] = useState<Contact | null>(null);

    //const [newContact, setNewContact] = useState<Omit<PhoneBook, 'id'>>();
   // const [isDesktop, setIsDesktop] = useState(false);
const [contactsList, setContactsList] = useState<PhoneBook[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [visibleCount, setVisibleCount] = useState(20);
const listRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getPhoneBookList();
            setContactsList(data);
        };
        fetchData();
    }, []);
    
  useEffect(() => {
  setVisibleCount(20); // מתחילים מחדש
}, [searchTerm]);

const handleScroll = () => {
  if (!listRef.current) return;
  const { scrollTop, scrollHeight, clientHeight } = listRef.current;

  if (scrollTop + clientHeight >= scrollHeight - 50) {
    setVisibleCount((prev) => Math.min(prev + 20, filteredContacts.length));
  }
};
    // useEffect(() => {
    //     const checkScreenSize = () => {
    //         setIsDesktop(window.innerWidth >= 768);
    //     };
    //     checkScreenSize();
    //     window.addEventListener('resize', checkScreenSize);
    //     return () => window.removeEventListener('resize', checkScreenSize);
    // }, []);

    const filteredContacts = contactsList.filter((contact) => {
        const term = searchTerm.trim().toLowerCase();
        return (
            contact.contact.toLowerCase().includes(term) ||
            contact.name.toLowerCase().includes(term) ||
            contact.phoneNum.includes(term)
        );
    });
    const visibleContacts = filteredContacts.slice(0, visibleCount);

   

    // const updateContact = () => {
    //     if (editingContact) {
    //         setContactsList(
    //             contactsList.map((contact) => (contact.id === editingContact.id ? editingContact : contact))
    //         );
    //         setEditingContact(null);
    //     }
    // };

    // const deleteContact = (id: number) => {
    //     // setContacts(contacts.filter((contact) => contact.id !== id));
    // };

    const callContact = (phone: string) => {
        window.open(`tel:${phone}`);
    };
    // const highlightMatch = (text: string, query: string) => {
    //     if (!query) return text;

    //     const regex = new RegExp(`(${query})`, 'gi');
    //     return text.split(regex).map((part, i) =>
    //         part.toLowerCase() === query.toLowerCase() ? (
    //             <mark key={i} className="bg-yellow-200 font-bold">{part}</mark>
    //         ) : (
    //             part
    //         )
    //     );
    // };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans p-4" dir="rtl">
            <div className="bg-white p-4 shadow-md rounded-xl mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className=" text-gray-600 text-2xl font-bold flex items-center gap-2">
                        <Building /> אלפון חברות
                    </h1>
                    {/* <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                    >
                        <Plus size={20} />
                    </button> */}
                </div>
                {/* Search */}
                <div className="relative">
                    {searchTerm ? (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-4 text-gray-400 hover:text-red-500"
                        >
                            <X size={18} />
                        </button>
                    ) : (
                        <Search className="absolute right-3 top-4 text-gray-400" size={20} />
                    )}
                    <input
                        type="text"
                        placeholder="חפש לפי שם או חברה..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-gray-600 w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* {showAddForm && (
                <div className="bg-white p-4 rounded-xl shadow-md mb-4">
                    <h3 className="text-lg font-semibold mb-2">הוסף איש קשר</h3>
                    <input
                        type="text"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        placeholder="שם"
                        className="w-full p-2 mb-2 border rounded-lg"
                    />
                    <input
                        type="text"
                        value={newContact.company}
                        onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                        placeholder="חברה"
                        className="w-full p-2 mb-2 border rounded-lg"
                    />
                    <input
                        type="tel"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        placeholder="טלפון"
                        className="w-full p-2 mb-2 border rounded-lg"
                    />
                    <button
                        onClick={addContact}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                    >
                        שמור
                    </button>
                </div>
            )} */}
            {/* model */}
            {selectedContact && (
                <div className="fixed inset-0  bg-opacity-40 backdrop-blur-sm backdrop-saturate-150 flex items-center justify-center z-50">

                    <div className="bg-opacity-40 bg-white p-6 rounded-xl shadow-xl w-[300px]  max-w-sm">
                        <h2 className="text-gray-600 text-xl font-bold mb-4">פרטי איש קשר</h2>
                        <div className="text-gray-500 space-y-2 text-right">
                            
                            <div><strong>שם: </strong> {selectedContact.contact}</div>
                            <div><strong>חברה: </strong> {selectedContact.name}</div>
                            <div> <strong>דוא"ל: </strong>{' '}
                                <a href={`mailto:${selectedContact.officeEmail}`} className="text-blue-600 underline">
                                    {selectedContact.officeEmail}
                                </a></div>
                            <div><strong>טלפון: </strong>
                                <a
                                    href={`tel:${selectedContact.phoneNum}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {selectedContact.phoneNum}
                                </a> </div>
                            <div className="flex items-center gap-2">
                                <strong>נייד: </strong>
                                <a
                                    href={`tel:${selectedContact.contactCell}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {selectedContact.contactCell}
                                </a>
                               {selectedContact.contactCell &&( <a
                                    href={`https://wa.me/${selectedContact.contactCell.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="שלח הודעה ב־WhatsApp"
                                >
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                        alt="WhatsApp"
                                        className="w-5 h-5"
                                    />
                                </a>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <strong>כתובת: </strong> {selectedContact.addressName}
                               {selectedContact.addressName &&( <a
                                    href={`https://waze.com/ul?q=${encodeURIComponent(selectedContact.addressName)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="פתח ב-Waze"
                                >
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Waze_logo.svg/32px-Waze_logo.svg.png"
                                        alt="Waze"
                                        className="w-5 h-5 inline-block"
                                    />
                                </a>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setSelectedContact(null)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                סגור
                            </button>
                        </div>
                    </div>
                </div>
            )}
        <div
           ref={listRef}
           onScroll={handleScroll}
           className="h-[80vh] overflow-y-auto border p-2"
  >
            <div className="grid gap-3">

                {visibleContacts.map((contact, index) => (
                    <div key={index}
                        className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center"
                        onClick={() => setSelectedContact(contact)}
                    >
                        {/* <div className="flex justify-between items-center"> */}
                        <div>
                            <div className="text-lg font-semibold text-gray-800">{contact.contact}</div>
                            <div className="text-sm text-gray-500">{contact.name}</div>
                            <div className="text-sm flex items-center gap-2">
                                {contact.contactCell || contact.phoneNum ? (
                                    <>
                                        <a
                                            href={`tel:${contact.contactCell || contact.phoneNum}`}
                                            className="text-blue-600 hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {contact.contactCell || contact.phoneNum}
                                        </a>

                                        {contact.contactCell && (
                                            <a
                                                href={`https://wa.me/${contact.contactCell.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                title="שלח ב־WhatsApp"
                                            >
                                                <img
                                                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                                    alt="WhatsApp"
                                                    className="w-4 h-4"
                                                />
                                            </a>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-gray-500">אין מספר</span>
                                )}
                            </div>

                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => callContact(contact.phoneNum)} className="text-green-600"><Phone /></button>
                            {/* <button onClick={() => setEditingContact(contact)} className="text-blue-600"><Edit2 /></button>
                <button onClick={() => deleteContact(contact.id)} className="text-red-600"><Trash2 /></button> */}
                        </div>

                    </div>
                ))}
                  {visibleCount < filteredContacts.length && (
      <div className="text-center text-sm text-gray-500 py-4">טוען עוד...</div>
    )}
            </div>
            </div>
        </div>
    );
}
