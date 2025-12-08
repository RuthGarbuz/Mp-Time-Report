import { useEffect, useRef, useState } from 'react';
import { Phone, Plus, Search, X } from 'lucide-react';
import { getPhoneBookCompanyList } from '../../services/phoneBookService';
import type { PhoneBook } from '../../interface/interfaces';
import UpdatePhoneBook from './UpdatePhoneBook';

export default function BusinessPhonebook() {
  const [selectedContact, setSelectedContact] = useState<PhoneBook | null>(null);

  const [contactsList, setContactsList] = useState<PhoneBook[]>([]);



  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [newContact, setNewContact] = useState<PhoneBook>(
    {
      id: 0,
      firstName: '',
      lastName: '',
      company: '',
      companyAddress: '',
      companyPhone: '',
      mobile: '',
      email: '',
      selectedCompanyId: 0,
      companyCityID: 0
    }
  );

  //   const [companies, setCompanies] = useState([
  //     { id: 1, name: 'בנק הפועלים', address: 'רחב רוטשילד 1, תל אביב', phone: '03-5653000' },
  //     { id: 2, name: 'טכנולוגיות אינטל', address: 'הר חוצבים 15, ירושלים', phone: '02-5894000' },
  //     { id: 3, name: 'מיקרוסופט ישראל', address: 'אינשטיין 3, תל אביב', phone: '03-9721000' },
  //     { id: 4, name: 'גוגל ישראל', address: 'טוצ\'ו 98, תל אביב', phone: '03-7600000' }
  //   ]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);




  const getData = async () => {
    const phoneBookData = await getPhoneBookCompanyList();

    if (phoneBookData) {
      setContactsList(phoneBookData.phoneBooks);

    }

  };

  useEffect(() => {
    setNewContact(
      {
        id: 0,
        firstName: '',
        lastName: '',
        company: '',
        companyAddress: '',
        companyPhone: '',
        mobile: '',
        email: '',
        selectedCompanyId: 0,
        companyCityID: 0
      }
    )
    getData();
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


  const filteredContacts = contactsList.filter((contact) => {
    const term = searchTerm.trim().toLowerCase();
    return (
      contact.firstName.toLowerCase().includes(term) ||
      contact.lastName.toLowerCase().includes(term) ||
      contact.company.toLowerCase().includes(term) ||
      contact.companyPhone?.includes(term) ||
      contact.mobile.includes(term)

    );
  });
  const visibleContacts = filteredContacts.slice(0, visibleCount);




  const callContact = (phone: string) => {
    if (!phone) return;
    const a = document.createElement('a');
    a.href = `tel:${phone}`;
    a.click();

  };




  // const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const email = e.target.value;
  //   setNewContact({ ...newContact, email: e.target.value })
  //   if (email && !validateEmail(email)) {
  //     setEmailError("האימייל לא תקין");
  //   } else {
  //     setEmailError("");
  //   }
  // };



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
  const normalizeForWhatsApp = (raw?: string | null) => {
    if (!raw) return null;

    // Keep only digits
    let digits = raw.replace(/\D/g, "");

    // Remove leading 00 (international prefix)
    if (digits.startsWith("00")) digits = digits.slice(2);

    // Remove leading country code 972 if repeated
    if (digits.startsWith("972")) digits = digits.slice(3);

    // Remove leading 0 from local numbers
    if (digits.startsWith("0")) digits = digits.slice(1);

    // Now always add 972 in front
    digits = "972" + digits;

    // Sanity check: only digits and reasonable length
    if (!/^\d{11,12}$/.test(digits)) return null;

    return digits;
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* <div className="relative"> */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 relative w-full ">
          <input
            type="text"
            placeholder="חפש לפי שם או חברה..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-gray-600 w-full pr-10 pl-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute  left-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X size={18} />
            </button>
          ) : (
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          )}
        </div>
        {/* </div> */}

        {/* Add Contact Modal */}
        {/* Contact Modal */}
        {selectedContact && (

          <UpdatePhoneBook
            mode='update'
            contact={selectedContact}
            onClose={() => { setSelectedContact(null); }}
            onSave={() => { setSelectedContact(null), getData() }}


          //handleAddContact={handleAddContact}
          />
        )}



        {/* Add Contact Modal */}
        {isAddModalOpen && (
          <UpdatePhoneBook
            mode='add'
            contact={newContact}
            onClose={() => { setIsAddModalOpen(false) }}
            onSave={() => { setIsAddModalOpen(false), getData() }}

          //handleAddContact={handleAddContact}

          />

        )}


        <div
          ref={listRef}
          onScroll={handleScroll}
          className="h-[calc(100vh-180px)] overflow-y-auto rounded-2xl shadow-2xl bg-white/10"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-2 ">
         
            {visibleContacts.map((contact, index) => (
              <div key={index}
                className="backdrop-blur-lg border-b border-white/20 py-6  mx-4 text-white flex justify-between items-center"
                onClick={() => {
                 
                  setSelectedContact(contact)
                }
                 
                }
              >
         
                <div>
                  <div className="text-lg font-semibold text-gray-800">{contact.firstName} {contact.lastName}</div>
                  <div className="text-sm text-gray-500">{contact.company}</div>
                  <div className="text-sm flex items-center gap-2">
                    {contact.mobile || contact.companyPhone ? (
                      <>
                        <a
                          href={`tel:${contact.mobile || contact.companyPhone}`}
                          className="text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contact.mobile || contact.companyPhone}
                        </a>
                        {contact.mobile && (() => {
                          const waNum = normalizeForWhatsApp(contact.mobile);
                          if (!waNum) return null;

                          return (
                            <a
                              href={`https://wa.me/${waNum}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="שלח ב־WhatsApp"
                            >
                              <img
                                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                alt="WhatsApp"
                                className="w-5 h-5"
                              />
                            </a>
                          );
                        })()}

                      </>
                    ) : (
                      <span className="text-gray-500">אין מספר</span>
                    )}
                  </div>

                </div>
                <div className="flex">
                  <button

                    onClick={(e) => {
                      e.stopPropagation();
                      callContact(contact.companyPhone ?? '')
                    }
                    }
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
                    title="התקשר"
                  >
                    <Phone size={18} />
                  </button>

                </div>

              </div>
            ))}
            {visibleCount < filteredContacts.length && (
              <div className="text-center text-sm text-gray-500 py-4">טוען עוד...</div>
            )}
          </div>
        </div>


        {/* Floating Add Button - Fixed Position */}
        <div className="fixed bottom-20 right-6 z-40 group">
          <button

            onClick={() => {
              setIsAddModalOpen(true)
            }}
            className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-6 h-6" />
          </button>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            הוסף איש קשר
          </span>
        </div>
      </div>

    </div>
  );
}



