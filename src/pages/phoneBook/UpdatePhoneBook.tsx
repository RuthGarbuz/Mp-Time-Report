import React, { useEffect, useState } from "react";
import { Phone, Edit3, Save, X, Mail, User } from "lucide-react";
import type { City, PhoneBook, Company } from "../../interface/PhoneBookModel";
import { addCompany, addPhoneBookContact, getPhoneBookCompanyList, updateCompany, updatePhoneBookContact } from "../../services/phoneBookService";
import AutoComplete from "../shared/autoCompleteInput";
import type { Global } from "../../interface/meetingModel";


interface UpdatePhoneBookProps {
    mode: "add" | "update";
    contact: PhoneBook | null;
    onClose: () => void;
    onSave: () => void;
}

const UpdatePhoneBook: React.FC<UpdatePhoneBookProps> = ({
    mode,
    contact,
    onClose,
    onSave,
}) => {
    const isAddMode = mode === "add";
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingCompany, setIsAddingCompany] = useState(false);
    const [errorFirstName, setErrorFirstName] = useState("");
    const [errorCompany, setErrorCompany] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [selectedCompany, setSelectedCompany] = useState<Global | null>(null);

    const [companiesList, setCompaniesList] = useState<Company[]>([]);
    const [citiesList, setCitiesList] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [editData, setEditData] = useState<PhoneBook>({
        id: 0,
        firstName: '',
        lastName: '',
        company: '',
        companyAddress: '',
        companyPhone: '',
        mobile: '',
        email: '',
        selectedCompanyId: 0,
        companyCityID: undefined
    });
    const getData = async () => {
        const phoneBookData = await getPhoneBookCompanyList();

        if (phoneBookData) {
            setCompaniesList(phoneBookData.companies);
            setCitiesList(phoneBookData.cities);
        }

    };
    const setCompanyData = async () => {
        if (isAddingCompany && editData.company) {
            // Add new company
            const newCompany: Company = {
                id: Date.now(),
                name: editData.company,
                address: editData.companyAddress ?? '',
                phoneNum: editData.companyPhone ?? '',
                cityID: editData.companyCityID  // Use selected city if available, fallback to 0
            };
            const newCompanyID = await addCompany(newCompany);
            //let newCompanyID = await addNewCompany(newCompany);
            if (newCompanyID && newCompanyID > 0) {
                editData.selectedCompanyId = newCompanyID;
                newCompany.id = newCompanyID;
            }
            //setCompaniesList([...companiesList, newCompany]);
        }
        else if (editData.selectedCompanyId) {
            // Use existing company
            const selectedCompany = companiesList.find(c => c.id === editData.selectedCompanyId);
            editData.company = selectedCompany?.name || '';
            editData.companyAddress = (selectedCompany?.address || '');
            editData.companyPhone = selectedCompany?.phoneNum || '';
        }
    }
    const setErrors = () => {
        let hasError = false;
        setErrorFirstName("");
        setErrorCompany("");
        setErrorEmail("");
        if (!editData.firstName || editData.firstName.trim() === "") {
            hasError = true;
            setErrorFirstName("שם פרטי הוא שדה חובה");
        }
        if (!editData.selectedCompanyId && (!editData.company || editData.company.trim() === "")) {
            hasError = true;
            setErrorCompany("שם חברה הוא שדה חובה");
        }

        if (editData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
            hasError = true;
            setErrorEmail("כתובת אימייל לא תקינה");
        }
        return hasError;
    }
    const handleAddContact = async () => {


        if (setErrors()) return;
        //add new contact

        await setCompanyData();
        const newContactID = await addPhoneBookContact(editData);

        if (newContactID) {
            onSave()

        }

        //resetForm();
        //setUpdate(false);
    }
    const saveChanges = async () => {
        if (setErrors()) return;
        if (isAddingCompany && editData.company) {
            // Add new company
            const Company: Company = {
                id: editData.selectedCompanyId,
                name: editData.company,
                address: editData.companyAddress ?? '',
                phoneNum: editData.companyPhone ?? '',
                cityID: editData.companyCityID  // Use selected city if available, fallback to 0
            };
            const update = await updateCompany(Company);

            if (update) {

            }
        }
        const upDateContact = await updatePhoneBookContact(editData)
        if (upDateContact) {
            onSave()
        }

    };
    const clearCompanyData = () => {
        editData.company = '';
        editData.companyAddress = '';
        editData.companyPhone = '';
        editData.companyCityID = undefined;
    }
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
    const handleCitySelect = (city: City) => {
        setSelectedCity(city);
        setEditData((prev) => ({
            ...prev,
            companyCityID: city.id ?? 0,
        }));
    };
    useEffect(() => {

        setIsEditing(isAddMode)
        if (contact) {
            getData();
            setEditData(contact);
            setIsAddingCompany(false);
        }
    }, [contact]);

    useEffect(() => {
        setSelectedCity(editData.companyCityID ? citiesList.find(c => c.id === editData.companyCityID) || null : null);
    }, [citiesList]);
  useEffect(() => {
        setSelectedCompany(editData?.selectedCompanyId ? companiesList!.find(c => c.id === editData.selectedCompanyId) || null : null);
    }, [companiesList]);
  const handleCompanySelect = (company: Global) => {
        setSelectedCompany(company);
        setEditData({ ...editData, selectedCompanyId: Number(company.id) });
   
    };
    if (!contact) return null;
    return (
        <div className=" text-gray-800 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}

                <div className="flex items-center justify-between relative w-full">
                    {/* left button (edit/save or placeholder) */}
                    <div className="w-8 h-8 flex items-center justify-center">
                        {!isAddMode && (
                            <button
                                onClick={() => {
                                    isEditing ? saveChanges() : setIsEditing(true);
                                    setIsAddingCompany(false);
                                }}
                                className="w-8 h-8 flex items-center justify-center"
                            >
                                {isEditing ? (
                                    <Save className="w-5 h-5 text-blue-600" />
                                ) : (
                                    <Edit3 className="w-5 h-5 text-gray-500" />
                                )}
                            </button>
                        )}
                    </div>

                    {/* centered title */}
                    <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-gray-800">
                        {isAddMode
                            ? "הוסף איש קשר"
                            : isEditing
                                ? "עריכת איש קשר"
                                : "פרטי איש קשר"}
                    </h2>

                    {/* right button (X) */}
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                {/* Scrollable body */}
                <div className="p-4 space-y-3 overflow-y-auto">
                    {/* Details */}
                    <div className="space-y-3">
                        {/* Name */}
                        <div className="text-right">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User className="w-4 h-4 inline ml-1" /> שם פרטי*
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.firstName || ""}
                                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            ) : (
                                <div className="min-h-[48px] not-only:text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                    {contact.firstName}
                                </div>
                            )}
                            {errorFirstName && 
                            <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                            <p className="text-red-500 text-sm mt-1">{errorFirstName}</p>
                             </div>}
                        </div>
                        {/* LastName */}
                        <div className="text-right">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User className="w-4 h-4 inline ml-1" /> שם משפחה
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.lastName || ""}
                                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            ) : (
                                <div className=" min-h-[48px] text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                    {contact.lastName}
                                </div>
                            )}
                            {/* {errorLastName && <p className="text-red-500 text-sm mt-1">{errorLastName}</p>} */}

                        </div>
                        {/* Company */}
                        <div className="text-right">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                חברה*
                            </label>

                            {isAddMode ? (
                                <>
                                    <div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="companyOption"
                                                checked={!isAddingCompany}
                                                onChange={() => setIsAddingCompany(false)}
                                                className="text-purple-600"
                                            />
                                            <span className=" block text-sm font-medium text-gray-700 mb-2">בחר חברה קיימת</span>
                                        </label>
                                    </div>
                                    {!isAddingCompany && (
 <AutoComplete
                            items={companiesList}
                            selectedItem={selectedCompany}
                            onSelect={(company) => {
                                handleCompanySelect(company);
                            }}
                            getItemId={(company) => company.id}
                            getItemLabel={(company) => company.name}
                            placeholder="בחר חברה..."
                            height={2}
                        />
                                        // <select
                                        //     value={editData.selectedCompanyId}
                                        //     onChange={(e) => setEditData({ ...editData, selectedCompanyId: Number(e.target.value) })}
                                        //     className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        // >
                                        //     <option value="">בחר חברה...</option>
                                        //     {companiesList.map(company => (
                                        //         <option
                                        //             key={company.id} value={company.id}>
                                        //             {company.name}
                                        //         </option>
                                        //     ))}
                                        // </select>


                                    )}
                                    <div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="companyOption"
                                                checked={isAddingCompany}
                                                onChange={() => { clearCompanyData(), setIsAddingCompany(true) }}
                                                className="text-purple-600"
                                            />
                                            <span className=" block text-sm font-medium text-gray-700 mb-2">הוסף חברה חדשה</span>
                                        </label>
                                    </div>
                                </>
                            ) : (<>
                                <div className="min-h-[48px] text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                    {contact.company}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 ">
                                        <input
                                            type="checkbox"
                                            name="companyOption"
                                            checked={isAddingCompany}
                                            onChange={(e) => setIsAddingCompany(e.target.checked)}
                                            className="text-purple-600"
                                        />
                                        <span className="block text-lg font-bold text-gray-700 mt-2 mb-2"> פרטי חברה </span>
                                    </label>
                                </div>
                            </>)
                            }
                            {isAddingCompany && (
                                <div className="space-y-3">
                                    {isEditing && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                שם החברה *
                                            </label>

                                            <input
                                                type="text"
                                                value={editData.company || ""}
                                                onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}

                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        כתובת החברה
                                    </label>

                                    {isEditing ? (
                                        <>
                                            {/* כתובת */}
                                            <input
                                                type="text"
                                                value={editData.companyAddress || ""}
                                                onChange={(e) => setEditData({ ...editData, companyAddress: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="הכנס כתובת..."
                                            />

                                            {/* עיר */}
                                            <div className="relative w-full">
                                                <label className="block text-sm font-medium text-gray-700  mb-2">
                                                    עיר החברה
                                                </label>
                                                <AutoComplete
                                                    items={citiesList}
                                                    selectedItem={selectedCity}
                                                    onSelect={(city) => {
                                                        handleCitySelect(city);
                                                        // update your state with city.id
                                                    }}
                                                    getItemId={(city) => city.id}
                                                    getItemLabel={(city) => city.name}
                                                    placeholder="בחר עיר..."

                                                />
                                            </div>
                                            {/* <select
                                                value={editData.companyCityID || ""}
                                                onChange={(e) => setEditData({ ...editData, companyCityID: Number(e.target.value) })}
                                                className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            >
                                                <option value="">בחר עיר...</option>
                                                {citiesList.map((city) => (
                                                    <option className="text-gray-800" key={city.id} value={city.id}>
                                                        {city.name}
                                                    </option>
                                                ))}
                                            </select> */}
                                        </>
                                    ) : (
                                        <div className="min-h-[48px] flex items-center gap-2 text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">

                                            {(() => {
                                                const city = citiesList.find((c) => c.id === contact.companyCityID);
                                                return (
                                                    <>
                                                        <span>
                                                            {contact.companyAddress || ""}
                                                            {city ? `, ${city.name}` : ""}
                                                        </span>


                                                        {(contact.companyAddress || city) && (
                                                            <a
                                                                href={`https://waze.com/ul?q=${encodeURIComponent(
                                                                    `${contact.companyAddress || ""} ${city ? city.name : ""}`
                                                                )}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="פתח ב־Waze"
                                                            >
                                                                <img
                                                                    src="/wazeURL.png"
                                                                    alt="Waze"
                                                                    className="w-5 h-5 inline-block"
                                                                />
                                                            </a>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        טלפון החברה
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editData.companyPhone || ""}
                                            onChange={(e) => setEditData({ ...editData, companyPhone: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="min-h-[48px] text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                            {contact.companyPhone}
                                        </div>
                                    )}
                                    {/* <input
                                    type="tel"
                                    value={editData.companyPhone}
                                    onChange={(e) => onChange("companyPhone", e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="טלפון החברה"
                                /> */}
                                </div>
                            )}

                        </div>
                        {errorCompany && <p className="text-red-500 text-sm mt-1">{errorCompany}</p>}

                        {/* Phone */}
                        <div className="text-right">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Phone className="w-4 h-4 inline ml-1" /> טלפון נייד
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={editData.mobile || ""}
                                    onChange={(e) => setEditData({ ...editData, mobile: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            ) : (
                                <div className="min-h-[48px] flex items-center gap-2 text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                    <a href={`tel:${contact.mobile}`} className="text-blue-600 hover:underline">
                                        {contact.mobile}
                                    </a>
                                    {contact.mobile && (() => {
                                        const waNum = normalizeForWhatsApp(contact.mobile);
                                        if (!waNum) return null;

                                        return (
                                            <a

                                                href={`https://wa.me/${waNum}`}
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
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div className="text-right">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Mail className="w-4 h-4 inline ml-1" /> אימייל
                            </label>

                            {isEditing ? (
                                <>
                                    <input
                                        type="email"
                                        value={editData.email || ""}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="name@example.com"
                                    />
                                </>
                            ) : (
                                <div className="min-h-[48px] text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-left">
                                    {contact.email ? (
                                        <a
                                            href={`mailto:${contact.email}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {contact.email}
                                        </a>
                                    ) : (
                                        <span className="text-gray-400">לא הוזן אימייל</span>
                                    )}
                                </div>
                            )}
                            
                            {errorEmail &&
                             <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                                <p className="text-red-500 text-sm mt-1">{errorEmail}</p>
                                </div>}

                        </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-3 pt-4">
                        {isAddMode ? (
                            <>
                                <button
                                    onClick={() => { onClose() }}
                                    className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                                >
                                    ביטול
                                </button>
                                {/* save */}
                                <button
                                    onClick={handleAddContact}
                                    // disabled={!contact.firstName || !contact.lastName || !contact.mobile || (isAddingCompany && !contact.company) || (!isAddingCompany && !contact.selectedCompanyId)}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    שמור
                                </button>
                            </>) : (
                            <>
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false),
                                                    setEditData(contact)
                                            }}
                                            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                                        >
                                            ביטול
                                        </button>
                                        <button
                                            onClick={() => saveChanges()}
                                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
                                        >
                                            שמור שינויים
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => { setIsEditing(true), setIsAddingCompany(false) }}
                                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            ערוך איש קשר
                                        </button>
                                        <a
                                            href={`tel:${editData.mobile}`}
                                            className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Phone className="w-4 h-4" />
                                            התקשר
                                        </a>
                                    </>
                                )}
                            </>
                        )
                        }

                    </div>
                </div>

            </div>
        </div>
    );
};

export default UpdatePhoneBook;