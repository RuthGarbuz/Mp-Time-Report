import { useState, useEffect } from 'react';
import EmployeeProfileCard from './shared/employeeProfileCard';
import { useNavigate } from "react-router-dom";
import type { Employee, PhoneBook } from '../interface/interfaces';
import type { CalendarDataModal } from '../interface/meetingModel';
import AddMeetingModal from './meeting/meetingModalOpen';
import UpdatePhoneBook from './phoneBook/UpdatePhoneBook';
import CreateUpdateTaskModal from './tasks/createUpdateTaskModal';
import HourReportModalOpen from './projectHours/HourReportModalOpen';
import employeeService from '../services/employeeService';
interface MenuItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  route: string;
}
const HomePage = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showHourReportModal, setShowHourReportModal] = useState(false);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarDataModal | null>(null);
  const [newContact, setNewContact] = useState<PhoneBook | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const result = await employeeService.getEmployee();
        const empData = result.data;
        if (empData) {
          setEmployee(empData);
        }
       
      } catch (error) {
        console.error('Failed to fetch employee:', error);
      }
    };

    fetchEmployee();
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  // useEffect(() => {
  //     const storedEmployee = authService.getCurrentEmployee();
  //     if (storedEmployee) {
  //       setEmployee(storedEmployee);
  //     } else {
  //       setEmployee(null);
  //     }

  //   }, []);
  const menuItems: MenuItem[] = [
    { id: '1', label: 'דיווח נכחות', icon: '✓', color: 'from-green-500 to-green-600', route: '/main/report-time' },
    { id: '2', label: 'הוסף+ איש קשר/חברה', icon: '👤', color: 'from-blue-500 to-blue-600', route: '/add-contact' },
    { id: '3', label: 'הוסף+ שעות לפרויקט', icon: '⏱', color: 'from-orange-500 to-orange-600', route: '/add-project-hours' },
    { id: '4', label: 'הוסף+ משימה', icon: '✔', color: 'from-purple-500 to-purple-600', route: '/add-task' },
    { id: '5', label: 'הוסף+ פגישה', icon: '📅', color: 'from-pink-500 to-pink-600', route: '/add-meeting' }
  ];
  const handleClick = (item: MenuItem) => {
    switch (item.id) {
      case '1':
        navigate("/main/report-time");
        break;
      case '2':
        openPhoneBook();
        setShowContactModal(true);
        break;
      case '3':
        setShowHourReportModal(true);
        break;
      case '4':
        setShowTaskModal(true);
        break;
      case '5':
        openMeeting();
        setShowMeetingModal(true);
        break;
    }
  };
  const handleTouchStart = (id: string) => {
    setActiveItem(id);
  };
  const handleTouchEnd = () => {
    setActiveItem(null);
  };
  const openMeeting = () => {
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
  const openPhoneBook = () => {

    let newContact: PhoneBook = {
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
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto h-full flex flex-col">

        {/* Employee Profile Section */}
        <EmployeeProfileCard
          employee={employee!}
        ></EmployeeProfileCard>

        {/* <div className="max-w-4xl mx-auto px-6 py-6"> */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onTouchStart={() => handleTouchStart(item.id)}
              onTouchEnd={handleTouchEnd}
              className={`
                relative aspect-square rounded-3xl flex flex-col items-center justify-center
                transition-all duration-300 ease-out bg-gradient-to-br ${item.color}
                transform
                ${hoveredItem === item.id ? 'scale-105 shadow-2xl -translate-y-2' : 'scale-100 shadow-lg'}
                ${activeItem === item.id ? 'scale-95' : ''}
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              `}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center justify-center gap-3 text-white p-4">
                <span className={`text-4xl transition-transform duration-300 ${hoveredItem === item.id || activeItem === item.id ? 'scale-125' : 'scale-100'}`}>
                  {item.icon}
                </span>
                <span className="text-base font-semibold text-center leading-tight">{item.label}</span>
              </div>
              {activeItem === item.id && (
                <div className="absolute inset-0 rounded-3xl">
                  <div className="absolute inset-0 rounded-3xl bg-white/30 animate-ping" />
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-red-500 text-red-500 rounded-full font-semibold hover:bg-red-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>התנתק</span>
          </button>
        </div>
      </div>
      {showMeetingModal && (
        <AddMeetingModal
          isOpen={showMeetingModal}
          setIsOpen={setShowMeetingModal}
          onClose={() => { setShowMeetingModal(false); }}
          event={selectedEvent ?? undefined}
          isRecurrence={false}
          userID={employee ? employee.id : 0}
          checkRrecurrenceChild={functionToFix}
        />
      )}

      {showContactModal && (
        <UpdatePhoneBook
          mode='add'
          contact={newContact}
          onClose={() => { setShowContactModal(false) }}
          onSave={() => { setShowContactModal(false) }}
        />
      )}
      {/* Add Task Modal */}
      {showTaskModal && (
        <CreateUpdateTaskModal
          isOpen={showTaskModal}
          editingId={0}
          taskDetails={null!}
          close={() => { setShowTaskModal(false) }}
        />
      )}
      {showHourReportModal && (
        <HourReportModalOpen
          title={"הוספת דיווח חדש"}
          isOpen={showHourReportModal}
          onClose={() => { setShowHourReportModal(false); }}
          report={null}
          employee={employee!}
          currentDay={new Date()}
          editingReportId={0}
        />
      )}

    </div>
  );
};
export default HomePage;
