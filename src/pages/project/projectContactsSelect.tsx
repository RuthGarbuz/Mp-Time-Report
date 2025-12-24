import React, { useEffect, useState } from 'react';
import { Search, Plus, Trash2, X } from 'lucide-react';
import type { ContactsToInsert, IdNameDto } from '../../interface/project';
import projectService from '../../services/projectService';


type ProjectParticipantsProps = {
    onClose: () => void;
    selectedContacts: IdNameDto[];
    setSelectedContacts: React.Dispatch<React.SetStateAction<IdNameDto[]>>;
    availableContacts:  IdNameDto[];
    projectID:number;
};

const ProjectParticipants: React.FC<ProjectParticipantsProps> = ({
    onClose,
    selectedContacts,
    setSelectedContacts,
    availableContacts,
    projectID
}) => {
//export default function ProjectParticipants() {
  const [participants, setParticipants] = useState<IdNameDto[]>(selectedContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [newContacts, setNewContacts] = useState<IdNameDto[]>([]);
const [filteredContacts,setFilteredContacts] = useState<IdNameDto[]>([]);
useEffect(() => {
    const results = availableContacts.filter(
      contact =>
         !participants.find(p => p.id === contact.id) &&
      contact.name.includes(searchTerm) 
);
setFilteredContacts(results);

    }, [searchTerm, participants,availableContacts]);

  const addParticipant = (contact: IdNameDto) => {
    setNewContacts([...newContacts, contact]);
    setParticipants([...participants, contact]);
    setSearchTerm('');
    setShowSearch(false);
  };

  const removeParticipant = async (id: number) => {
    const isNewContact = newContacts.find(p => p.id === id);
        if (isNewContact) {
          setNewContacts(newContacts.filter(p => p.id !== id));
          setParticipants(participants.filter(p => p.id !== id));
          setSelectedContacts(selectedContacts.filter(p => p.id !== id));
          return;
        }
    const contactToRemove = await projectService.deleteProjectContacts(id,projectID);
    if(contactToRemove){
    setSelectedContacts(participants.filter(p => p.id !== id));
    setParticipants(participants.filter(p => p.id !== id));
    }
  };

const handleAddContacts = async (contacts: IdNameDto[]) => {
    if(contacts.length===0) return;
  // Convert IdNameDto[] to ContactsToInsert[]
  const lastIndex=selectedContacts.length||0;
  const contactsToInsert: ContactsToInsert[] = contacts.map((contact, index) => ({
    projectID: projectID || 0, // Use the projectID from props, fallback to 0 if null
    contactID: contact.id,
    orderNum: lastIndex + index + 1 // Order starts from lastIndex + 1
  }));

  // Send to API
  const insert = await projectService.inserProjectContacts(contactsToInsert);
  if(insert){
  // Update form data with the original contacts
  setSelectedContacts([
    ...selectedContacts,
    ...contacts
  ]);
}
close();
};
  return (
     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header - Fixed */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800">רשימת משתתפים בפרויקט</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="סגור"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Add Button */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            <span>הוסף משתתף</span>
                        </button>
                    </div>

                    {/* Search Box */}
                    {showSearch && (
                        <div className="mb-6 bg-gray-50 rounded-lg p-4 border-2 border-indigo-200">
                            <div className="flex items-center gap-2 mb-4">
                                <Search className="w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="חפש לפי שם..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    autoFocus
                                />
                                <button
                                    onClick={() => {
                                        setShowSearch(false);
                                        setSearchTerm('');
                                    }}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {searchTerm && (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {filteredContacts.length > 0 ? (
                                        filteredContacts.map(contact => (
                                            <div
                                                key={contact.id}
                                                className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors"
                                                onClick={() => addParticipant(contact)}
                                            >
                                                <div>
                                                    <div className="font-semibold text-gray-800">{contact.name}</div>
                                                </div>
                                                <Plus className="w-5 h-5 text-indigo-600" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-gray-500">לא נמצאו אנשי קשר</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Participants Table */}
                    {participants.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-200">
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                            שם איש קשר
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-24">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map((participant, index) => (
                                        <tr
                                            key={participant.id}
                                            className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                            }`}
                                        >
                                            <td className="px-6 py-4 text-gray-800 font-medium">
                                                {participant.name}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => removeParticipant(participant.id)}
                                                    className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="מחק משתתף"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-gray-400 mb-4">
                                <Search className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                אין משתתפים בפרויקט
                            </h3>
                            <p className="text-gray-500">לחץ על "הוסף משתתף" כדי להתחיל</p>
                        </div>
                    )}

                    {/* Counter */}
                    {participants.length > 0 && (
                        <div className="mt-6 text-center text-gray-600">
                            סך הכל: <span className="font-bold text-indigo-600">{participants.length}</span>{' '}
                            משתתפים
                        </div>
                    )}
                </div>

                {/* Footer - Fixed */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        ביטול
                    </button>
                    <button
                        onClick={async () => {
                            await handleAddContacts(newContacts);
                            onClose();
                        }}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                    >
                        שמור
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectParticipants;