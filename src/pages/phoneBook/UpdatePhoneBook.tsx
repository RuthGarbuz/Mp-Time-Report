import React, { useEffect, useState } from "react";
import { Phone, Edit3, Save, X, Mail, User } from "lucide-react";
import type { City, PhoneBook,Company } from "../../interface/interfaces";
import { updateCompany, updatePhoneBookContact } from "../../services/phoneBookService";



interface UpdatePhoneBookProps {
    contact: PhoneBook | null;
    onClose: () => void;
    onSave: () => void;
    citiesList: City[];
}

const UpdatePhoneBook: React.FC<UpdatePhoneBookProps> = ({
    contact,
    onClose,
    onSave,
    citiesList,
}) => {
    const [isEditing, setIsEditing] = useState(false);
      const [isAddingCompany, setIsAddingCompany] = useState(false);
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
    companyCityID: 0
  });
  
    const saveChanges = async () => {
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
  useEffect(() => {
  if (contact) {
    setEditData(contact);
    setIsAddingCompany(false);
  }
}, [contact]);
    if (!contact) return null;
    console.log("editData", editData)
    return (
        <div className=" text-gray-800 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="pt-1 flex items-center justify-between mb-2">


                    <button
                   
                        onClick={()=>{isEditing ? saveChanges() : setIsEditing(true), setIsAddingCompany(false) }}
                        className="w-8 h-8 flex items-center justify-center"
                    >
                        {isEditing ? (
                            <Save className="w-5 h-5 text-blue-600" />
                        ) : (
                            <Edit3 className="w-5 h-5 text-gray-500" />
                        )}
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800">
                        {isEditing ? "עריכת איש קשר" : "פרטי איש קשר"}
                    </h2>
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
                                <User className="w-4 h-4 inline ml-1" /> שם פרטי
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.firstName || ""}
                                    onChange={(e) => setEditData({...editData, firstName:e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            ) : (
                                <div className="min-h-[48px] not-only:text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                    {contact.firstName}
                                </div>
                            )}
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
                                    onChange={(e) => setEditData({...editData, lastName:e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            ) : (
                                <div className=" min-h-[48px] text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                    {contact.lastName}
                                </div>
                            )}
                        </div>
                        {/* Company */}
                        <div className="text-right">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                חברה
                            </label>
                            <div className="min-h-[48px] text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                {contact.company}
                            </div>
                            {/* {isEditing && !isAddingCompany ? (
                                <input
                                    type="text"
                                    value={editData.company || ""}
                                    onChange={(e) => onChange("company", e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            ) : (
                                <div className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                    {contact.company}
                                </div>
                            )} */}
                            <div>
                                <label className="flex items-center gap-2 ">
                                    <input
                                        type="checkbox"
                                        name="companyOption"
                                        checked={isAddingCompany}
                                        onChange={(e) =>setIsAddingCompany(e.target.checked) }
                                        className="text-purple-600"
                                    />
                                    <span className="block text-lg font-bold text-gray-700 mt-2 mb-2"> פרטי חברה </span>
                                </label>
                            </div>

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
                                                onChange={(e) => setEditData({...editData, company:e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                    {/* <input
                                    type="text"
                                    value={editData.company}
                                    onChange={(e) => onChange("company", e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                /> */}
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        כתובת החברה
                                    </label>

                                    {isEditing ? (
                                        <>
                                            {/* כתובת */}
                                            <input
                                                type="text"
                                                value={editData.companyAddress || ""}
                                                onChange={(e) => setEditData({...editData, companyAddress:e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="הכנס כתובת..."
                                            />

                                            {/* עיר */}
                                            <label className="block text-sm font-medium text-gray-700  mb-2">
                                                עיר החברה
                                            </label>
                                            <select
                                                value={editData.companyCityID || ""}
                                                onChange={(e) => setEditData({...editData, companyCityID:Number(e.target.value)})}
                                                className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            >
                                                <option value="">בחר עיר...</option>
                                                {citiesList.map((city) => (
                                                    <option className="text-gray-800" key={city.id} value={city.id}>
                                                        {city.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    ) : (
                                        <div className="min-h-[48px] flex items-center gap-2 text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">

                                            {(() => {
                                                const city = citiesList.find((c) => c.id === contact.companyCityID);
                                                console.log("city", citiesList, city?.name)
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
                                            onChange={(e) => setEditData({...editData, companyPhone:e.target.value})}
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

                        {/* Phone */}
                        <div className="text-right">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Phone className="w-4 h-4 inline ml-1" /> טלפון נייד
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={editData.mobile || ""}
                                    onChange={(e) => setEditData({...editData, mobile:e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            ) : (
                                <div className="min-h-[48px] flex items-center gap-2 text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                    <a href={`tel:${contact.mobile}`} className="text-blue-600 hover:underline">
                                        {contact.mobile}
                                    </a>
                                    {contact.mobile && (
                                        <a
                                            href={`https://wa.me/${contact.mobile
                                                .replace(/[^0-9]/g, "")
                                                .replace(/^0/, "972")}`}
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
                                        onChange={(e) => setEditData({...editData, email:e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="name@example.com"
                                    />

                                    {/* הצגת הודעת שגיאה */}
                                    {editData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email) && (
                                        <p className="text-red-500 text-sm mt-1">אנא הזן אימייל חוקי</p>
                                    )}
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
                        </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-3 pt-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={()=>{setIsEditing(false),
            setEditData(contact)}}
                                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                                >
                                    ביטול
                                </button>
                                <button
                                    onClick={()=>saveChanges()}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
                                >
                                    שמור שינויים
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={()=>{setIsEditing(true), setIsAddingCompany(false) }}
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
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UpdatePhoneBook;