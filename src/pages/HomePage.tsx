import { useState, useEffect, type ReactNode } from 'react';
import EmployeeProfileCard from './shared/employeeProfileCard';
import { useNavigate } from "react-router-dom";

import CreateUpdateTaskModal from './tasks/createUpdateTaskModal';
import HourReportModalOpen from './projectHours/HourReportModalOpen';
import employeeService from '../services/employeeService';
import { BarChart3, Calendar, ClipboardPlus, ClockPlus, List, Phone, UserCheck } from 'lucide-react';
import { useModal } from './ModalContextType';
import authService from '../services/authService';
import type { MainAppProps } from '../interface/MaimModel';
interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  color: string;
  route: string;
  visible?: boolean;
}
const HomePage: React.FC<MainAppProps> = ({ onLogout }) => {
  //const HomePage = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showHourReportModal, setShowHourReportModal] = useState(false);

  const [employee, setEmployee] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [selectedEvent, setSelectedEvent] = useState<CalendarDataModal | null>(null);
  // const [newContact, setNewContact] = useState<PhoneBook | null>(null);
  const { openModal, closeModal } = useModal();
    const [user, setUser] = useState<any>(null);
    
  const navigate = useNavigate();
  useEffect(() => {
    const fetchEmployee = async () => {
      setIsLoading(true);
      try {
        const result = await employeeService.getEmployee();
        const empData = result.data;
        if (empData) {
          setEmployee(empData);
        }
      } catch (error) {
        console.error('Failed to fetch employee:', error);
        setEmployee(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, []);

  useEffect(() => {
    closeModal();
    setIsVisible(true);
  }, []);
useEffect(() => {
    const fetchData = async () => {
      const user = authService.getCurrentUser();
      setUser(user)
    };
    fetchData();
  }, []);
  const menuItems: MenuItem[] = [
    { id: '1', label: 'דיווח נכחות', icon: <UserCheck className="w-12 h-12" />, color: 'from-green-500 to-green-600', route: '/main/report-time' ,visible:true },
    { id: '2', label: 'אלפון', icon: <Phone className="w-12 h-12" />, color: 'from-blue-500 to-blue-600', route: '/add-project-hours' ,visible:true},
    { id: '3', label: 'הוסף שעות לפרויקט', icon: <ClockPlus className="w-12 h-12" />, color: 'from-orange-500 to-orange-600', route: '/add-project-hours' ,visible:true},
    { id: '4', label: 'הוסף משימה', icon: <ClipboardPlus className="w-12 h-12" />, color: 'from-purple-500 to-purple-600', route: '/add-task',visible:true },
    { id: '5', label: ' יומן פגישות', icon: <div className="relative"><Calendar className="w-12 h-12" /><span className="absolute -top-1 -right-1 text-2xl font-bold"></span></div>, color: 'from-pink-500 to-pink-600', route: '/main/MyScheduler',visible:true },
    { id: '6', label: 'רשימת פרויקטים', icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, color: 'from-cyan-500 to-cyan-600', route: '/main/project-list', visible: true },
    { id: '7', label: 'יומן שיחות', icon: <List className="w-12 h-12" />, color: 'from-amber-500 to-amber-600', route: '/main/conversations-List', visible: true },
    { id: '8', label: 'מידע למנהל', icon: <BarChart3 className="w-12 h-12" />, color: 'from-teal-500 to-teal-600', route: '/main/managerDataMain', visible:user?.seeFinance  },
    
  ];
  const handleClick = (item: MenuItem) => {
    
    switch (item.id) {
      case '1':
        navigate("/main/report-time");
        break;
      case '2':
        navigate("/main/phone-book-List");
        //setShowContactModal(true);
        break;
      case '3':
        openModal();
        setShowHourReportModal(true);
        break;
      case '4':
        openModal();
        setShowTaskModal(true);
        break;
      case '5':
        navigate("/main/MyScheduler");
       // setShowMeetingModal(true);
        break;
       case '6':
        navigate("/main/project-list");
       // setShowMeetingModal(true);
        break;
      case '7':
        navigate("/main/conversations-List");
        break;
      case '8':
        navigate("/main/managerDataMain");
        break;
      default:
        break;
    }
  };
  const handleTouchStart = (id: string) => {
    setActiveItem(id);
  };
  const handleTouchEnd = () => {
    setActiveItem(null);
  };
 
  const handleLogout = () => {
    authService.logout();
    if (onLogout) {

      onLogout();
    }

    navigate('/login');
  };
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">טוען נתונים...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Employee Profile */}
            {employee && <EmployeeProfileCard employee={employee} />}

            {/* Menu Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {menuItems.map((item, index) => (
                // {item.visible !== false && ()}
              <button
              hidden={!item.visible}

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

            {/* Logout Button */}
            <div className="mt-5 flex justify-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-red-500 text-red-500 rounded-full font-semibold hover:bg-red-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>התנתק</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modals (always rendered, controlled by state) */}
      {/* {showMeetingModal && (
        <AddMeetingModal
          isOpen={showMeetingModal}
          setIsOpen={() => { setShowMeetingModal(false); closeModal(); }}
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
          onClose={() => { setShowContactModal(false); closeModal(); }}
          onSave={() => { setShowContactModal(false) }}
        />
      )} */}

      {showTaskModal && (
        <CreateUpdateTaskModal
          isOpen={showTaskModal}
          editingId={0}
          taskDetails={null!}
          close={() => { setShowTaskModal(false); closeModal(); }}
          employee={employee}
        />
      )}

      {showHourReportModal && (
        <HourReportModalOpen
          title={"הוספת דיווח חדש"}
          isOpen={showHourReportModal}
          onClose={() => { setShowHourReportModal(false); closeModal(); }}
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
