import { useEffect, useRef, useState } from 'react';
import { Phone, Plus, Search, X } from 'lucide-react';
import { addCompany, getPhoneBookCompanyList, updatePhoneBookContact } from '../services/phoneBookService';
import { addPhoneBookContact } from "../services/phoneBookService";
import type { City, Company, PhoneBook } from '../interface/interfaces';

export default function BusinessPhonebook() {
  const [selectedContact, setSelectedContact] = useState<PhoneBook | null>(null);
   const [emailError, setEmailError] = useState<string>("");
  //const [editingContact, setEditingContact] = useState<Contact | null>(null);
  //const [isDesktop, setIsDesktop] = useState(false);
  const [isUpdate, setUpdate] = useState(false);

  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [contactsList, setContactsList] = useState<PhoneBook[]>([]);
  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [citiesList, setCitiesList] = useState<City[]>([]);
  const [selectedCity, setselectedCity] = useState<number>();

  const [title, setTitle] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [newContact, setNewContact] = useState<PhoneBook>(
    {
      id:0,
      firstName: '',
      lastName: '',
      company: '',
      companyAddress: '',
      companyPhone: '',
      mobile: '',
      email: '',
      selectedCompanyId: 0
    }
  );

  //   const [companies, setCompanies] = useState([
  //     { id: 1, name: 'בנק הפועלים', address: 'רחב רוטשילד 1, תל אביב', phone: '03-5653000' },
  //     { id: 2, name: 'טכנולוגיות אינטל', address: 'הר חוצבים 15, ירושלים', phone: '02-5894000' },
  //     { id: 3, name: 'מיקרוסופט ישראל', address: 'אינשטיין 3, תל אביב', phone: '03-9721000' },
  //     { id: 4, name: 'גוגל ישראל', address: 'טוצ\'ו 98, תל אביב', phone: '03-7600000' }
  //   ]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setNewContact(prev => ({ ...prev, [name]: value }));
  // };
  const resetForm = () => {
    setNewContact({
      id:0,
      firstName: '',
      lastName: '',
      company: '',
      companyAddress: '',
      companyPhone: '',
      mobile: '',
      email: '',
      selectedCompanyId: 0
    });
    setIsAddingCompany(false);
    setselectedCity(undefined)
  };
  const setCompanyData = async () => {
 if (isAddingCompany && newContact.company) {
        // Add new company
        const newCompany: Company = {
          id: Date.now(),
          name: newContact.company,
          address: newContact.companyAddress ?? '',
          phoneNum: newContact.companyPhone ?? '',
          cityID: selectedCity  // Use selected city if available, fallback to 0
        };
        const newCompanyID = await addCompany(newCompany);
        //let newCompanyID = await addNewCompany(newCompany);
        if (newCompanyID && newCompanyID > 0) {
          newContact.selectedCompanyId = newCompanyID;
          newCompany.id=newCompanyID;
        }
        setCompaniesList([...companiesList, newCompany]);
      }
      else if (newContact.selectedCompanyId) {
        // Use existing company
        const selectedCompany = companiesList.find(c => c.id === newContact.selectedCompanyId);
        newContact.company = selectedCompany?.name || '';
        newContact.companyAddress = (selectedCompany?.address || '');
        newContact.companyPhone = selectedCompany?.phoneNum || '';
      }
  }
  const handleAddContact = async () => {
   console.log("Adding/updating contact:", newContact); 
       if (!validateEmail(newContact.email)) {
      setEmailError("האימייל לא תקין");
      return;
    }
    if(newContact.id && newContact.id>0 ){
      // update existing contact
     // const selectedContactObj = contactsList.find(contact => contact.id === newContact.id);
     if(isAddingCompany ){
         await setCompanyData();
        }

      const updatedContacts = contactsList.map(contact => 
        contact.id === newContact.id ? {...newContact} : contact
      );
      const success = await updatePhoneBookContact(newContact);
      console.log("Update success:", success);
      setContactsList(updatedContacts);
     
    }
  
    else{//add new contact
    if (newContact.firstName && newContact.lastName && newContact.mobile) {
    await setCompanyData();
      } 
      const newContactID = await addPhoneBookContact(newContact);
       if (newContactID && newContactID > 0) {
          newContact.id = newContactID;
           setContactsList([...contactsList, newContact]);
        }
     
    
    }
     setIsAddModalOpen(false);
      resetForm();
      setUpdate(false);
    }
  


  useEffect(() => {

    const fetchData = async () => {
      const phoneBookData = await getPhoneBookCompanyList();

      if (phoneBookData) {
        setContactsList(phoneBookData.phoneBooks);
        setCompaniesList(phoneBookData.companies);
        setCitiesList(phoneBookData.cities);
      }

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
    if (!phone) return;
    const a = document.createElement('a');
  a.href = `tel:${phone}`;
  a.click();
 
  };
  const openEditContact=(contact: PhoneBook)=> {
    newContact.id=contact.id;
    newContact.company=contact.company;
    newContact.selectedCompanyId=contact.selectedCompanyId;
    newContact.companyAddress=contact.companyAddress; 
    newContact.companyPhone=contact.companyPhone;
    newContact.email=contact.email;
    newContact.firstName=contact.firstName; 
    newContact.lastName=contact.lastName; 
    newContact.mobile=contact.mobile; 
    setTitle('עריכת איש קשר');

    setIsAddModalOpen(true);
  }
const clearCompanyData=()=>{
  newContact.company='';
  newContact.companyAddress='';
  newContact.companyPhone='';
  //newContact.selectedCompanyId=0;
  setselectedCity(undefined);
}
 const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setNewContact({ ...newContact, email: e.target.value })
    if (email && !validateEmail(email)) {
      setEmailError("האימייל לא תקין");
    } else {
      setEmailError("");
    }
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
    <div className="h-full bg-gradient-to-br from-purple-500 via-pink-300 to-pink-500 font-sans p-4" dir="rtl">
      {/*old // <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50  font-sans p-4" dir="rtl"> */}
      <div className="bg-white shadow-md rounded-full mb-4">

        <div className="relative">

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
              className="absolute left-3 top-4 text-gray-400 hover:text-red-500"
            >
              <X size={18} />
            </button>
          ) : (
            <Search className="absolute left-3 top-4 text-gray-400" size={20} />
          )}
        </div>
      </div>
     
      {/* Add Contact Modal */}
      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <button
                onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                className=" text-gray-500 p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Personal Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">שם פרטי *</label>
                <input
                  type="text"
                  value={newContact.firstName}
                  onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                  className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="הכנס שם פרטי"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">שם משפחה *</label>
                <input
                  type="text"
                  value={newContact.lastName}
                  onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                  className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="הכנס שם משפחה"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">טלפון נייד *</label>
                <input
                  type="tel"
                  value={newContact.mobile}
                  onChange={(e) => setNewContact({ ...newContact, mobile: e.target.value })}
                  className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="050-1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">אימייל</label>
                {/* <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="example@company.com"
                /> */}
                 <input
        type="email"
        value={newContact.email}
        onChange={handleEmailChange}
        className={`text-gray-800 w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
          emailError
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-purple-500"
        }`}
        placeholder="example@company.com"
      />
      {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
              </div>

              {/* Company Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">חברה *</label>
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="companyOption"
                        checked={!isAddingCompany}
                        onChange={() => setIsAddingCompany(false)}
                        className="text-purple-600"
                      />
                      <span className=" text-gray-800 text-sm">בחר חברה קיימת</span>
                    </label>
                  </div>
 
                  {!isAddingCompany && (
                    
                    <select
                      value={newContact.selectedCompanyId}
                      onChange={(e) => setNewContact({ ...newContact, selectedCompanyId: Number(e.target.value) })}
   className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
//className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
           //           className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">בחר חברה...</option>
                      {companiesList.map(company => (
                        <option 
                        //className=" text-sm text-gray-700 bg-white hover:bg-purple-100" 
                        key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>

                  
                  )}

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="companyOption"
                        checked={isAddingCompany}
                        onChange={() =>{clearCompanyData(), setIsAddingCompany(true)}}
                        className="text-purple-600"
                      />
                      <span className=" text-gray-800 text-sm">הוסף חברה חדשה</span>
                    </label>
                  </div>

                  {isAddingCompany && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newContact.company}
                        onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                        className=" text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="שם החברה *"
                      />
                      <input
                        type="text"
                        value={newContact.companyAddress}
                        onChange={(e) => setNewContact({ ...newContact, companyAddress: e.target.value })}
                        className=" text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="כתובת החברה"
                      />
                      <select
                        value={selectedCity}
                        onChange={(e) => setselectedCity(Number(e.target.value))}
                        className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">בחר עיר...</option>
                        {citiesList.map(city => (
                          <option className=" text-gray-800" key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={newContact.companyPhone}
                        onChange={(e) => setNewContact({ ...newContact, companyPhone: e.target.value })}
                        className=" text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="טלפון החברה"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                ביטול
              </button>
              {/* save */}
              <button
                onClick={handleAddContact}
                disabled={!newContact.firstName || !newContact.lastName || !newContact.mobile || (isAddingCompany && !newContact.company)||(!isAddingCompany&&!newContact.selectedCompanyId)}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {title}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* model */}
      {selectedContact && (
        <div className="fixed inset-0  bg-opacity-40 backdrop-blur-sm backdrop-saturate-150 flex items-center justify-center z-50">

          <div className="bg-opacity-40 bg-white p-6 rounded-xl shadow-xl w-[300px]  max-w-sm">
            <h2 className="text-gray-600 text-xl font-bold mb-4">פרטי איש קשר</h2>
            <div className="text-gray-500 space-y-2 text-right">

              <div><strong>שם: </strong> {selectedContact.firstName} {selectedContact.lastName}</div>
              <div><strong>חברה: </strong> {selectedContact.company}</div>
              <div> <strong>דוא"ל: </strong>{' '}
                <a href={`mailto:${selectedContact.email}`} className="text-blue-600 underline">
                  {selectedContact.email}
                </a></div>
              <div><strong>טלפון: </strong>
                <a
                  href={`tel:${selectedContact.companyPhone}`}
                  className="text-blue-600 hover:underline"
                >
                  {selectedContact.companyPhone}
                </a> </div>
              <div className="flex items-center gap-2">
                <strong>נייד: </strong>
                <a
                  href={`tel:${selectedContact.mobile}`}
                  className="text-blue-600 hover:underline"
                >
                  {selectedContact.mobile}
                </a>

                {selectedContact.mobile && (
                  <a
                    href={`https://wa.me/${selectedContact.mobile
                      .replace(/[^0-9]/g, '') // מסירים כל דבר שהוא לא מספר
                      .replace(/^0/, '972')  // מחליפים את 0 ההתחלתי בקידומת ישראל
                      }`}
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
                <strong>כתובת: </strong> {selectedContact.companyAddress}
                {selectedContact.companyAddress && (<a
                  href={`https://waze.com/ul?q=${encodeURIComponent(selectedContact.companyAddress)}`}
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
                onClick={() =>{setUpdate(false),
                  setSelectedContact(null)
                } }
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
        className="h-[calc(100vh-180px)] overflow-y-auto rounded-2xl shadow-2xl bg-white/10"
      >
        {/* <div className="bg-white/30 backdrop-blur-lg p-6 rounded-3xl shadow-xl mb-8"> */}
        <div className="grid grid-cols-1  shadow-xl rounded-2xl ">
          {/* <div className="grid gap-3"> */}
          {/* "bg-white p-4 rounded-xl shadow-sm flex justify-between items-center" */}
          {visibleContacts.map((contact, index) => (
            <div key={index}
              className="backdrop-blur-lg border-b border-white/20 py-6  mx-4 text-white flex justify-between items-center"
              onClick={() =>{
                setUpdate(true),
                openEditContact(contact)
              }
                 //setSelectedContact(contact)
                }
            >
              {/* <div className="flex justify-between items-center"> */}
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

                      {contact.mobile && (
                        <a
                          href={`https://wa.me/${contact.mobile.replace(/[^0-9]/g, '')}`}
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
              <div className="flex">
                <button
               
                  onClick={(e) =>{
                    e.stopPropagation();
                    callContact(contact.companyPhone ?? '')
                }
                  }
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
                  title="התקשר"
                >
                  <Phone size={18} />
                </button>
                {/* old button */}
                {/* <button onClick={() => callContact(contact.phoneNum)} className="text-green-600"><Phone /></button> */}
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
    
     
      {/* Floating Add Button - Fixed Position */}
      <div className="fixed bottom-20 right-6 z-40 group">
        <button
    
          onClick={() => {setTitle('הוספת איש קשר'),
            setIsAddModalOpen(true)}}
          className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-6 h-6" />
        </button>
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          הוסף איש קשר
        </span>
      </div>
    </div>
    // </div>
  );
}



