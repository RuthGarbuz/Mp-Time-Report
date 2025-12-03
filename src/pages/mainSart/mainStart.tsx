import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UpdatePhoneBook from "../phoneBook/UpdatePhoneBook";
import AddMeetingModal from "../meeting/meetingModalOpen";
import authService from "../../services/authService";
import type { Employee, PhoneBook } from "../../interface/interfaces";
import type { CalendarDataModal } from "../../interface/meetingModel";

// /src/pages/mainSart/mainStart.tsx

/**
 * MainStart page with buttons that navigate to other pages and request those pages to open modals.
 *
 * Behavior:
 * - "Open Task" navigates to /task-list and requests the TaskList page to open the Create/Update Task modal in "create" mode.
 * - "Open Phone Book" navigates to /update-phone-book.
 * - "New Conversation" navigates to /conversations and requests it to open the new conversation modal.
 * - "New Meeting" navigates to /meetings and requests it to open the new meeting modal.
 *
 * Target pages should read location.state to react:
 *   const location = useLocation();
 *   const shouldOpenCreateTask = location.state?.openCreateUpdateTaskModal?.mode === 'create';
 *   const shouldOpenConversation = location.state?.conversationModalOpen === true;
 *   const shouldOpenMeeting = location.state?.meetingModalOpen === true;
 */

const MainStart: React.FC = () => {
    const navigate = useNavigate();
 const [showAddModal, setShowAddModal] = useState(false);
 const [showTaskModal, setShowTaskModal] = useState(false);

   const [employee, setEmployee] = useState<Employee | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarDataModal | null>(null);
    const [newContact, setNewContact] = useState<PhoneBook | null>(null);

    const openTask = useCallback(() => {
        setShowAddModal(true);
        // Navigate to the TaskList page and pass state asking it to open the Create/Update Task modal in "create" mode
        navigate("/task-list", {
            state: {
                openCreateUpdateTaskModal: { mode: "create" },
            },
        });
    }, [navigate]);

    const openPhoneBook =() => {
       
          let  newContact:PhoneBook={
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
      setNewContact(newContact);
        }
    

    const openConversation = useCallback(() => {
        navigate("/conversations", {
            state: { conversationModalOpen: true },
        });
    }, [navigate]);

    const openMeeting =() => {
        const newEvent: CalendarDataModal = {
        
              calendarEventDto: {
                id: 0, // generate temporary unique id
                parentId: null,
                title: "חדשה", // default title
                start: new Date().toISOString(),
                end: new Date().toISOString(),
                rRule: null,
                exDate: null,
                allDay: true,
                indexInSeries: null,
                type: 0, // 0 = regular meeting (you can change)
                recurrenceXml: null,
                employeeId: employee ? employee.id : 0,
              },
              calendarPartData: {
                cityID: null,
                projectID: null,
                projectName: null,
                statusID: null,
                categoryID: null,
                description: "",
                hasReminder: false,
                reminderTime: null,
                location: "",
                meetingLink: "",
                isPrivate: false,
        
              },
            };
            setSelectedEvent(newEvent);
   
    }
    const functionToFix = (): any => {
    return false;
  }
useEffect(() => {
    const storedEmployee = authService.getCurrentEmployee();
    if (storedEmployee) {
      setEmployee(storedEmployee);
    } else {
      setEmployee(null);
    }

  }, []);
    return (
        <div  className=" text-gray-800 p-20" dir="rtl">
            <h2>Main Start</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={openTask}>Open Task (create)</button>
                <button onClick={() =>{openPhoneBook(); setShowTaskModal(true);}}>הוספת איש קשר</button>
                <button onClick={openConversation}>הוספת שיחה חדשה</button>
                <button onClick={()=>{openMeeting();    setShowAddModal(true);}}>הוספת פגישה</button>
            </div>
             {/* {showAddModal && (
        <CreateUpdateTaskModal
          isOpen={showAddModal}
          editingId={0}
          newTaskDetails={newTaskDetails}
          setNewTaskDetails={setNewTaskDetails}
          errorSubject={errorSubject}
          errorTime={errorTime}
          errorRecipient={errorRecipient}
          close={() => setShowAddModal(false)}
          addDetailedTask={addDetailedTask}
          employeesList={employeesList}
        />
      )} */}
      {showAddModal && (
              <AddMeetingModal
                isOpen={showAddModal}
                setIsOpen={setShowAddModal}
                onClose={() => { setShowAddModal(false); }}
                event={selectedEvent??undefined}
                isRecurrence={false}
                userID={employee ? employee.id : 0}
                checkRrecurrenceChild={functionToFix}
              />
            )}

             {showTaskModal && (
        <UpdatePhoneBook
          mode='add'
          contact={newContact}
          onClose={() => { setShowTaskModal(false) }}
          onSave={() => { setShowTaskModal(false) }}
        />
      )}
        </div>
    );
};

export default MainStart;