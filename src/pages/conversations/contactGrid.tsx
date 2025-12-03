import React, { useState } from 'react';

import {  X, Check } from 'lucide-react';
import type { Contact } from '../../interface/interfaces';

type ConversationModalProps = {
    onClose: () => void;
    contacts: Contact[];
    handleSelectContact: (contact: Contact) => Promise<void> | void;
};






const ContactsGrid: React.FC<ConversationModalProps> = ({
    // isOpen,
    onClose,
    contacts,
    handleSelectContact,

}) => {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto p-5 overflow-hidden">
                <div className="flex items-center justify-between  pb-2 mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">רשימת אנשי קשר</h2>
                    <button onClick={onClose} className="hover:bg-gray-100 rounded-lg p-2 transition" > <X size={22} /> </button>
                </div>
                <input type="text"
                    placeholder="חיפוש..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <div className="max-h-[60vh] overflow-y-auto rounded-lg">
                    <table className=" w-full border-collapse table-fixed">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="text-center p-3 font-semibold text-gray-700 border-b w-1/5"> בחר</th>
                                <th className="text-right p-3 font-semibold text-gray-700 border-b w-2/5"> שם איש קשר </th>
                                <th className="text-right p-3 font-semibold text-gray-700 border-b w-2/5"> חברה </th>
                            </tr>
                        </thead>
                        <tbody >
                            {filteredContacts.length === 0 ?
                                (<tr>
                                    <td colSpan={3} className="text-center py-8 text-gray-500 whitespace-nowrap" > לא נמצאו תוצאות </td>
                                </tr>) :
                                (filteredContacts.map((contact) => (
                                    <tr key={contact.id}
                                        className="border-b border-gray-200 hover:bg-purple-50 transition cursor-pointer"
                                        onClick={() => setSelectedContact(contact)}
                                        onDoubleClick={() => handleSelectContact(contact)} >
                                        <td className="p-3 item-center flex items-center justify-center"> <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedContact(contact) }}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mt-1 flex-shrink-0 ${selectedContact === contact
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'border-gray-300 hover:border-green-400 text-white'
                                                }`}
                                        >
                                            {<Check size={16} />}
                                        </button></td>
                                        <td className="p-3 text-gray-800 break-words"> {contact.name} </td>
                                        <td className="p-3 text-gray-600 break-words"> {contact.companyName} </td>
                                        {/* <td className="p-3 text-center"> <button onClick={(e) => { e.stopPropagation(); handleSelectContact(contact); }} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-lg hover:shadow-md transition flex items-center gap-2 mx-auto" >
                                            <Check size={16} /> בחר </button> </td> */}

                                    </tr>)))}
                        </tbody>
                    </table>
                </div>
                {/* כפתורים */}
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300"
                    >
                        ביטול
                    </button>
                    <button
                        onClick={async () => await handleSelectContact(selectedContact!)}
                        // className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-lg hover:shadow-md transition flex items-center gap-2 mx-auto"
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 transition"
                    >
                        אישור
                    </button>
                </div>
            </div>
        </div>



    );

};



export default ContactsGrid;