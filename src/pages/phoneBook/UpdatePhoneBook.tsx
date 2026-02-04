/**
 * UpdatePhoneBook Component - Contact Modal Form
 * 
 * Displays a modal for adding or editing phone book contacts with:
 * - Personal information (first name, last name, mobile, email)
 * - Company information (name, address, city, phone)
 * - Option to add new company or select existing
 * - Validation and error handling
 * - Integration with WhatsApp and Waze
 * 
 * All business logic extracted to usePhoneBookModal hook
 * This component handles only UI rendering
 */

import React from "react";
import { Phone, Edit3, Save, X, Mail, User } from "lucide-react";
import { usePhoneBookModal } from './hooks/usePhoneBookModal';
import { normalizeForWhatsApp, type PhoneBook } from './models';
import AutoComplete from "../shared/autoCompleteInput";

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
    // ==========================================================================
    // Hook - All business logic extracted
    // ==========================================================================
    
    const {
        // State
        editData,
        isEditing,
        isAddingCompany,
        isSaving,
        errors,
        title,
        companiesList,
        citiesList,
        selectedCompany,
        selectedCity,
        
        // Actions
        updateField,
        handleCompanySelect,
        handleCitySelect,
        clearCompanyData,
        setIsAddingCompany,
        handleSave,
        toggleEdit,
    } = usePhoneBookModal({
        mode,
        initialContact: contact || {
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
        },
        isOpen: !!contact,
        onClose,
        onSave,
    });

    // ==========================================================================
    // Utilities
    // ==========================================================================
    
    const isAddMode = mode === "add";
    
    if (!contact) return null;

    // ==========================================================================
    // Render
    // ==========================================================================
    
    return (
        <div className="text-gray-800 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                
                {/* Header */} 
                 <div className="relative pt-1 flex items-center justify-between mb-2 px-4">

                    {/* Left button (edit/save or placeholder) */}
                    <div className="w-8 h-8 flex items-center justify-center">
                        {!isAddMode && (
                            <button
                                onClick={toggleEdit}
                                disabled={isSaving}
                                className="w-8 h-8 flex items-center justify-center disabled:opacity-50"
                            >
                                {isEditing ? (
                                    <Save className="w-5 h-5 text-blue-600" />
                                ) : (
                                    <Edit3 className="w-5 h-5 text-gray-500" />
                                )}
                            </button>
                        )}
                    </div>

                    {/* Centered title */}
                    <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-gray-800">
                        {title}
                    </h2>

                    {/* Right button (X) */}
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 flex items-center justify-center"
                        disabled={isSaving}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="p-4 space-y-3 overflow-y-auto">
                    
                    {/* First Name */}
                    <div className="text-right">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4 inline ml-1" /> שם פרטי*
                        </label>
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    value={editData.firstName || ""}
                                    onChange={(e) => updateField('firstName', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                {errors.firstName && (
                                    <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="min-h-[48px] text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                {contact.firstName}
                            </div>
                        )}
                    </div>

                    {/* Last Name */}
                    <div className="text-right">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4 inline ml-1" /> שם משפחה
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.lastName || ""}
                                onChange={(e) => updateField('lastName', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        ) : (
                            <div className="min-h-[48px] text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                {contact.lastName}
                            </div>
                        )}
                    </div>

                    {/* Company */}
                    <div className="text-right">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            חברה*
                        </label>

                        {isAddMode ? (
                            <>
                                {/* Select existing company */}
                                <div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="companyOption"
                                            checked={!isAddingCompany}
                                            onChange={() => setIsAddingCompany(false)}
                                            className="text-purple-600"
                                        />
                                        <span className="block text-sm font-medium text-gray-700 mb-2">
                                            בחר חברה קיימת
                                        </span>
                                    </label>
                                </div>
                                
                                {!isAddingCompany && (
                                    <AutoComplete
                                        items={companiesList}
                                        selectedItem={selectedCompany}
                                        onSelect={handleCompanySelect}
                                        getItemId={(company) => company.id}
                                        getItemLabel={(company) => company.name}
                                        placeholder="בחר חברה..."
                                        height={2}
                                    />
                                )}

                                {/* Add new company */}
                                <div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="companyOption"
                                            checked={isAddingCompany}
                                            onChange={() => {
                                                clearCompanyData();
                                                setIsAddingCompany(true);
                                            }}
                                            className="text-purple-600"
                                        />
                                        <span className="block text-sm font-medium text-gray-700 mb-2">
                                            הוסף חברה חדשה
                                        </span>
                                    </label>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="min-h-[48px] text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                    {contact.company}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="companyOption"
                                            checked={isAddingCompany}
                                            onChange={(e) => setIsAddingCompany(e.target.checked)}
                                            className="text-purple-600"
                                        />
                                        <span className="block text-lg font-bold text-gray-700 mt-2 mb-2">
                                            פרטי חברה
                                        </span>
                                    </label>
                                </div>
                            </>
                        )}

                        {/* Company Details */}
                        {isAddingCompany && (
                            <div className="space-y-3 mt-3">
                                {/* Company Name */}
                                {isEditing && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            שם החברה *
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.company || ""}
                                            onChange={(e) => updateField('company', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                )}

                                {/* Company Address */}
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    כתובת החברה
                                </label>
                                
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editData.companyAddress || ""}
                                            onChange={(e) => updateField('companyAddress', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="הכנס כתובת..."
                                        />

                                        {/* City */}
                                        <div className="relative w-full mt-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                עיר החברה
                                            </label>
                                            <AutoComplete
                                                items={citiesList}
                                                selectedItem={selectedCity}
                                                onSelect={handleCitySelect}
                                                getItemId={(city) => city.id}
                                                getItemLabel={(city) => city.name}
                                                placeholder="בחר עיר..."
                                            />
                                        </div>
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

                                {/* Company Phone */}
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    טלפון החברה
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={editData.companyPhone || ""}
                                        onChange={(e) => updateField('companyPhone', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="min-h-[48px] text-lg text-gray-800 bg-gray-50 p-3 rounded-lg text-right">
                                        {contact.companyPhone}
                                    </div>
                                )}
                            </div>
                        )}

                        {errors.company && (
                            <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                                <p className="text-red-500 text-sm mt-1">{errors.company}</p>
                            </div>
                        )}
                    </div>

                    {/* Mobile Phone */}
                    <div className="text-right">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline ml-1" /> טלפון נייד
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={editData.mobile || ""}
                                onChange={(e) => updateField('mobile', e.target.value)}
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
                                    onChange={(e) => updateField('email', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="name@example.com"
                                />
                                {errors.email && (
                                    <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                    </div>
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

                    {/* General Error */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm text-center">{errors.general}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        {isAddMode ? (
                            <>
                                <button
                                    onClick={onClose}
                                    disabled={isSaving}
                                    className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                                >
                                    ביטול
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'שומר...' : 'שמור'}
                                </button>
                            </>
                        ) : (
                            <>
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                updateField('firstName', contact.firstName);
                                                updateField('lastName', contact.lastName);
                                                updateField('mobile', contact.mobile);
                                                updateField('email', contact.email);
                                                onClose();
                                            }}
                                            disabled={isSaving}
                                            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors disabled:opacity-50"
                                        >
                                            ביטול
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            {isSaving ? 'שומר...' : 'שמור שינויים'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={toggleEdit}
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdatePhoneBook;