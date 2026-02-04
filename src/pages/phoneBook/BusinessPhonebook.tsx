import { useRef } from 'react';
import { Phone,  Search, X } from 'lucide-react';
import { useModal } from '../ModalContextType';
import { usePhoneBook } from './hooks/usePhoneBook';
import { createInitialContact, normalizeForWhatsApp } from './models';
import UpdatePhoneBook from './UpdatePhoneBook';

export default function BusinessPhonebook() {
  const listRef = useRef<HTMLDivElement | null>(null);
  const { openModal, closeModal } = useModal();

  const {
    contacts,

    selectedContact,
    isAddModalOpen,
    isLoading,
    filterState,
    hasMore,
    setSearchTerm,
    loadMore,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
    handleSave,
  } = usePhoneBook(openModal, closeModal);

  const handleScroll = () => {
    if (!listRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadMore();
    }
  };
  const callContact = (phone: string) => {
    if (!phone) return;
    const a = document.createElement('a');
    a.href = `tel:${phone}`;
    a.click();
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 relative w-full">
          <input
            type="text"
            placeholder="חפש לפי שם או חברה..."
            value={filterState.searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-gray-600 w-full pr-4 pl-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {filterState.searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X size={18} />
            </button>
          ) : (
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          )}
        </div>

        {/* Contact List */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="h-[calc(100vh-180px)] overflow-y-auto rounded-2xl shadow-2xl bg-white/10"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-2">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">טוען...</div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>לא נמצאו אנשי קשר</p>
              </div>
            ) : (
              <>
                {contacts.map((contact, index) => {
                  // Create unique key: combine id, selectedCompanyId, firstName, lastName, and index
                  // This ensures uniqueness even when id or selectedCompanyId is 0
                  const uniqueKey = `contact-${contact.id}-${contact.selectedCompanyId}-${contact.firstName || ''}-${contact.lastName || ''}-${index}`;
                  
                  return (
                  <div
                    key={uniqueKey}
                    className="backdrop-blur-lg border-b border-white/20 py-6 mx-4 text-white flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors rounded-lg px-2"
                    onClick={() => openEditModal(contact)}
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
                  );
                })}
                {hasMore && (
                  <div className="text-center text-sm text-gray-500 py-4">טוען עוד...</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modals */}
        {selectedContact && (
          <UpdatePhoneBook
            mode="update"
            contact={selectedContact}
            onClose={closeEditModal}
            onSave={handleSave}
          />
        )}

        {isAddModalOpen && (
          <UpdatePhoneBook
            mode="add"
            contact={createInitialContact()}
            onClose={closeAddModal}
            onSave={handleSave}
          />
        )}


        {/* Floating Add Button */}
        <div className="fixed bottom-20 right-6 z-40 group">

          <button
            onClick={openAddModal}
            className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 group"

          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            הוסף איש קשר
          </span>
        </div>
      </div>

    </div>
  );
}



