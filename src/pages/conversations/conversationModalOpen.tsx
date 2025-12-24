import React, { useEffect, useState } from "react";
import { X, ChevronDownIcon, Edit3, Plus, Save } from "lucide-react";
import type { ConversationLogType, Contact, ConversationData } from "../../interface/ConversationModel";
import type { SelectEmployeesList } from "../../interface/MaimModel";
import Bars3Icon from "@heroicons/react/24/solid/esm/Bars3Icon";
import { GetContactsAsync, GetConversationLogTypes, insertConverstion, updateConverstion } from "../../services/TaskService";
import ContactsGrid from "./contactGrid";
import employeeService from '../../services/employeeService';
import AutoComplete from "../shared/autoCompleteInput";
type ConversationModalProps = {
    isOpen: boolean;

    newConversation: ConversationData;
    setNewConversation: React.Dispatch<React.SetStateAction<ConversationData>>;
    resetNewConversation: () => void;
    saveConversation: () => void;
    userID: number;
  //  employeesList: SelectEmployeesList[];
};

const ConversationModalOpen: React.FC<ConversationModalProps> = ({
    isOpen,
    newConversation,
    setNewConversation,
    resetNewConversation,
    saveConversation,
    userID,
   // employeesList
}) => {
    if (!isOpen) return null;
    const [errorSubject, setErrorSubject] = useState("");
    const [errorTime, setErrorTime] = useState("");
    const [errorRecipient, setErrorRecipient] = useState("");
    const [title, setTitle] = useState("פרטי שיחת לקוח");
    const [logTypes, setLogTypes] = useState<ConversationLogType[]>([]);
    const [contactsList, setContactsList] = useState<Contact[]>([]);
    const [isOpenContactList, setIsOpenContactList] = useState(false);
    const [isnew, setIsnew] = useState(false);


    const [selectedEmployee, setSelectedEmployee] = useState<SelectEmployeesList | null>(null);
    //  const [editingId, setEditingId] = useState<number>(0);
    const [isOpenType, setIsOpenType] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [employeesList, setEmployeesList] = useState<SelectEmployeesList[]>([]);


    const inputClass = `text-gray-800 w-full px-3 py-2 ${isReadOnly ? " bg-gray-50" : "border border-gray-300 "}  rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none`;

    useEffect(() => {
        const init = async () => {

            try {
                 const employeeData: SelectEmployeesList[] = await employeeService.getEmployeesList();
                                if (employeeData) {
                                    setEmployeesList(employeeData);
                                }
                if (localStorage.getItem('conversationLogTypes')) {
                    const storedLogTypes = JSON.parse(localStorage.getItem('conversationLogTypes') || '[]');

                    setLogTypes(storedLogTypes);
                }
                else {
                    const logTypesData = await GetConversationLogTypes();
                    if (logTypesData) {
                        setLogTypes(logTypesData);

                    }

                }
            } catch (err) {
                console.error("Error initializing modal:", err);
            }
        };
        if (newConversation) init();
    }, [newConversation]);
        useEffect(() => {
            setSelectedEmployee(newConversation.recipientID ? employeesList!.find(e => e.id === newConversation.recipientID) || null : userID ? employeesList!.find(e => e.id === userID) || null : null);
    }, [employeesList]);
    const resetError = () => {
        setErrorSubject("");
        setErrorTime("");
        setErrorRecipient("");
    }
    const handleEditOrAddClick = (id: number) => {
        if (id == 0) {
            setNewConversation((prev: any) => ({
                ...prev,
                subject: "",
                organizerID: userID,
                recipientID: 0,
            }));
            setIsnew(true);
            setTitle("הוספת שיחה חדשה");
        }
        else {
            setIsnew(false);
            setTitle("עריכת שיחה");
        }
        setIsReadOnly(false);
    };
    const handleCancelClick = () => {
        resetNewConversation();
        resetError();

        setIsReadOnly(true);
    };

    const handleSaveClick = async () => {

        resetError();
        let hasError = false;
        if (newConversation.startDate && newConversation.dueDate && newConversation.startDate > newConversation.dueDate) {
            setErrorTime("תאריך/שעה לא תקין");
            hasError = true;

        }
        if (!newConversation.subject) {
            setErrorSubject("נדרש נושא השיחה");
            hasError = true;
        }
        if (!newConversation.recipientID) {

            setErrorRecipient("נדרש מקבל השיחה");
            hasError = true;
        }
        if (hasError) {
            return;
        }
        if (!isnew && newConversation.id) {
            const success = await updateConverstion(newConversation);
            if (success) {

            }
        }
        else {
            const taskData = await insertConverstion(newConversation);
            if (taskData > 0) {

            }
        }
        saveConversation();
        setIsReadOnly(true);
    };
    const setOpenContactList = async () => {
        const contactsData = await GetContactsAsync();
        if (contactsData) {
            setContactsList(contactsData as Contact[]);
        }
        setIsOpenContactList(true);
    }
    const handleSelectContact = (contact: Contact) => {
        setNewConversation((prev: any) => ({
            ...prev,
            contactID: contact.id,
            contactEmail: contact.email,
            contactPhone: contact.contactTell,
            contactCell: contact.contactCell,
            companyName: contact.companyName,
            contactName: contact.name,
        }));
        setIsOpenContactList(false);
    };

   
    const handleEmployeeSelect = (emp: SelectEmployeesList) => {
        setNewConversation((prev) => ({
            ...prev,
            recipientID: emp.id ? emp.id : 0,
        }));
        setSelectedEmployee(emp? emp :null);
    };
    const handleSelectType = (type: ConversationLogType) => {
        setNewConversation((prev) => ({
            ...prev,
            conversationLogTypeID: type.id ? type.id : 0,
            conversationLogTypeName: type.name ? type.name : "",

        }));

        setIsOpenType(false);
    }; return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="text-gray-800 bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between relative w-full">
                    {/* left button (edit/save or placeholder) */}
                    <div className="w-8 h-8 flex items-center justify-center">

                        <button
                            onClick={() => {
                                !isReadOnly ? handleSaveClick() : handleEditOrAddClick(newConversation.id);
                            }}
                            className="w-8 h-8 flex items-center justify-center"
                        >
                            {!isReadOnly ? (
                                <Save className="w-5 h-5 text-blue-600" />
                            ) : (
                                <Edit3 className="w-5 h-5 text-gray-500" />
                            )}
                        </button>

                    </div>
                    <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-gray-800">{title}</h2>
                    <button
                        onClick={() => { resetNewConversation(), resetError() }}
                        className="absolute left-0  w-8 h-8 flex items-center justify-center"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>

                </div>
                {/* <div className="relative pt-1 flex items-center justify-center mb-2"></div> */}

                {/* Body */}
                <div className="p-4 space-y-3 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-3">
                        {/* Project */}
                        <div className=" p-0 rounded">
                            <label className="block text-sm font-medium  text-gray-700 mb-1">
                                שם פרויקט
                            </label>
                            <input
                                type="text"
                                value={newConversation?.projectName}
                                className="w-full  not-only:text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right"
                                disabled
                            />
                        </div>
                        {/* Project */}
                        <div className="p-0 rounded">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                מקור
                            </label>
                            <input
                                type="text"
                                value={newConversation?.source}
                                className="w-full  not-only:text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right"
                                disabled
                            />
                        </div>
                    </div>
                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            תיאור השיחה<span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={newConversation.subject}
                            onChange={(e) =>
                                setNewConversation((prev: any) => ({ ...prev, subject: e.target.value }))
                            }
                            placeholder="תיאור השיחה..."
                            rows={3}
                            disabled={isReadOnly}
                            className={inputClass}
                            // className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500"
                            dir="rtl"
                        />
                        {errorSubject && <p className="text-red-500 text-sm mt-1">{errorSubject}</p>}

                    </div>

                    {/* Conversation Date */}
                    <div>
                        <div className="grid grid-cols-1 [@media(min-width:350px)]:grid-cols-2 gap-3 w-full">
                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">תאריך הפניה</label>
                                <input
                                    type="date"
                                    value={newConversation.startDate || ""}
                                    onChange={(e) =>
                                        setNewConversation((prev: any) => ({ ...prev, startDate: e.target.value }))
                                    }
                                    disabled={isReadOnly}
                                    className={inputClass}
                                // className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            {/* Due Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">תאריך חזרה</label>

                                <input
                                    type="date"
                                    value={newConversation.dueDate || ""}
                                    onChange={(e) =>
                                        setNewConversation((prev: any) => ({ ...prev, dueDate: e.target.value }))
                                    }
                                    disabled={isReadOnly}
                                    className={inputClass}
                                // className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        {errorTime && <p className="text-red-500 text-sm mt-1">{errorTime}</p>}
                    </div>
                    {/* Conversation Log Type */}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">סוג שיחה</label>
                        {/* new */}
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={newConversation.conversationLogTypeName}
                                onChange={() => {

                                    setIsOpenType(true);
                                }}
                                disabled={isReadOnly}
                                className={inputClass}
                            // className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent${errorRecipient ? "border-red-500" : "border-gray-300"
                            //     }`}
                            />
                            <button
                                type="button"
                                disabled={isReadOnly}
                                onClick={() => { setIsOpenType(!isOpenType) }}
                                className=" absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-purple-600"
                            >
                                <ChevronDownIcon className="h-6 w-6" />
                            </button>

                            {isOpenType && (
                                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {logTypes.map((lt: any) => (
                                        <li
                                            key={lt.id}
                                            onClick={() => handleSelectType(lt)}
                                            className="p-2 cursor-pointer  hover:bg-[#0078d7]  hover:text-white"
                                        >
                                            {lt.name}
                                        </li>
                                    ))}
                                </ul>
                            )}


                        </div>
                    </div>

                    {/* Orginizer (readonly) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">שולח</label>
                        <input
                            type="text"
                            value={employeesList.find(e => e.id === newConversation.organizerID)?.name || ""}//name
                            readOnly
                            text-gray-800 w-full px-3 py-2 bg-gray-50 rounded-lg
                            className="text-gray-800 w-full px-3 py-2 bg-gray-50  rounded-lg "
                        />

                    </div>
                    {/* Recipient */}
                    <div className="relative w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            מקבל<span className="text-red-500">*</span>
                        </label>
                        <AutoComplete
                           disabled={isReadOnly}
    items={employeesList}
    selectedItem={selectedEmployee}
    onSelect={handleEmployeeSelect}
    getItemId={(emp) => emp.id ?? 0}
    getItemLabel={(emp) => emp.name ?? ""}
    placeholder="בחר מקבל..."
    height={2}
/>
                        {errorRecipient && <p className="text-red-500 text-sm mt-1">{errorRecipient}</p>}
                    </div>
                    {/* Contact Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">איש קשר</label>
                        <div className="relative w-full">
                            <input
                                type="text"

                                value={newConversation.contactName || ""}
                                placeholder="בחר איש קשר..."
                                readOnly
                                disabled={isReadOnly}
                                className={inputClass}
                            // className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                onClick={() => setOpenContactList()}
                                disabled={isReadOnly}
                                className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-purple-600"
                            >
                                <Bars3Icon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Contact List Popup */}
                        {isOpenContactList && (
    
                            <ContactsGrid
                                contacts={contactsList}
                                onClose={() => { setIsOpenContactList(false) }}
                                handleSelectContact={(con:any) => {
                                handleSelectContact(con);
                            }}
                            ></ContactsGrid>
                            // <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            //     {contactsList.map((c) => (
                            //         <li
                            //             key={c.id}
                            //             onClick={() => handleSelectContact(c)}
                            //             className="p-2 cursor-pointer hover:bg-[#0078d7] hover:text-white"
                            //         >
                            //             {c.name} - {c.companyName}
                            //         </li>
                            //     ))}
                            // </ul>
                        )}
                    </div>

                    {/* Company Info */}
                    {/* {selectedContact && ( */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">

                            <div className=" ">
                                <label className="block text-sm font-medium  text-gray-700 mb-1">
                                    חברה:
                                </label>
                                <input
                                    type="text"
                                    value={newConversation?.companyName}
                                    className="text-gray-800 w-full px-3 py-2 bg-gray-50  rounded-lg "
                                    disabled
                                />
                            </div>
                            {/* Project */}
                            <div className="p-0 rounded">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    אימייל:
                                </label>
                                <input
                                    type="text"
                                    value={newConversation?.contactEmail}
                                    className="text-gray-800 w-full px-3 py-2 bg-gray-50  rounded-lg "
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">

                            <div className=" ">
                                <label className="block text-sm font-medium  text-gray-700 mb-1">
                                    מספר נייד:
                                </label>
                                <input
                                    type="text"
                                    value={newConversation?.contactCell}
                                    className="text-gray-800 w-full px-3 py-2 bg-gray-50  rounded-lg "
                                    disabled
                                />
                            </div>
                            {/* Project */}
                            <div className="p-0 rounded">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    מספר טלפון:
                                </label>
                                <input
                                    type="text"
                                    value={newConversation?.contactPhone}
                                    className="text-gray-800 w-full px-3 py-2 bg-gray-50  rounded-lg "
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                    {/* // <div className="space-y-2">
                        //     <div className="text-sm text-gray-700">
                        //         <strong>חברה:</strong> {selectedContact.companyName}
                        //     </div>
                        //     <div className="text-sm text-gray-700">
                        //         <strong>אימייל:</strong> {selectedContact.email}
                        //     </div>
                        //     <div className="text-sm text-gray-700">
                        //         <strong>מספר נייד:</strong> {selectedContact.cell}
                        //     </div>
                        //     <div className="text-sm text-gray-700">
                        //         <strong>מספר טלפון:</strong> {selectedContact.phone}
                        //     </div>
                        // </div> */}
                    {/* )} */}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        {isReadOnly ? (
                            <>
                                <button
                                    onClick={() => { handleEditOrAddClick(0) }}
                                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    הוסף חדש
                                </button>
                                <button
                                    onClick={() => { handleEditOrAddClick(newConversation.id) }}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    ערוך שינויים
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleCancelClick}
                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                                >
                                    ביטול
                                </button>
                                <button
                                    onClick={handleSaveClick}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-600"
                                >
                                    שמור
                                </button>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ConversationModalOpen;
