import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import ReportTime from './ReportTime';
import ReportList from './report/ReportList';
import { useLocation } from 'react-router-dom';

// import '../App.css';
import HomePage from './HomePage';
import type {  MainAppProps } from '../interface/interfaces';
import '../index.css';
import "tailwindcss";
import BusinessPhonebook from './phoneBook/BusinessPhonebook';
import authService from '../services/authService';
import TaskManager from './tasks/taskList';
import ProjectHours from './projectHours/ProjectHours';
import ManagerDataMain from './managerData/managerDataMain';
import ConversationList from './conversations/ConversationList';
const MainApp: React.FC<MainAppProps> = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const[titleName,setTitleName]=useState("");
  const [user, setUser] = useState<any>(null);

  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    authService.logout();
    if (onLogout){
       
      onLogout();
    } 
    navigate('/login');
  };

const location = useLocation();

React.useEffect(() => {
  // מפה של נתיבים לשמות בעברית
  const titleMap: Record<string, string> = {
    '/main/report-time': 'דיווח נוכחות',
    '/main/report-list': 'רשימת דיווחים',
    '/main/phone-book-List': 'אלפון',
    '/main/home': 'דף הבית',
    '/main/tasks-List': 'משימות',
    '/main/projectHours-List': 'שעות לפרויקטים',
    '/main/conversations-List': 'יומן שיחות',
    '/main/managerDataMain': 'נתונים למנהל',
  };

  const currentTitle = titleMap[location.pathname] || '';
  setTitleName(currentTitle);
}, [location.pathname]);
useEffect(() => {
    const fetchData = async () => {
      const user = authService.getCurrentUser();
      console.log("Current User:", user);
      setUser(user)
    };
    fetchData();
  }, []);
  return (
    
    <div className="main-wrapper">
      {/* Navbar */}
      <nav className="navbar"dir='rtl'>
        <div className="nav-title">
            <img src="/logo.png" alt="Logo" className="nav-icon" />
              {/* Time Report */}
              {titleName}
        </div>

        {/* Desktop menu */}
        <ul className="desktop-menu">
          <li onClick={handleLogout} className="logout">התנתק</li>
          <li><Link to="/main/report-list">רשימת דיווחים</Link></li>
          <li><Link to="/main/report-time">דיווח נכחות</Link></li>
          <li><Link to="/main/phone-book-List">אלפון</Link></li>
          <li><Link to="/main/tasks-List">משימות</Link></li>
          <li><Link to="/main/projectHours-List">שעות לפרויקטים</Link></li>
          <li><Link to="/main/conversations-List">יומן שיחות</Link></li>  
           {user?.seeFinance && (
        <li>
          <Link to="/main/managerDataMain">נתונים למנהל</Link>
        </li>
      )}
        </ul>
        {/* Mobile hamburger */}
        <button onClick={toggleMenu} className="hamburger" aria-label="Toggle menu">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
     {menuOpen && (
    <ul className="mobile-menu" style={{ direction: 'rtl' }}>
    <li><Link to="/main/report-time" onClick={() => setMenuOpen(false)}>דיווח נכחות</Link></li>
    <li><Link to="/main/report-list" onClick={() => setMenuOpen(false)}>רשימת דיווחים</Link></li>
    <li><Link to="/main/phone-book-List" onClick={() => setMenuOpen(false)}>אלפון</Link></li>
    <li><Link to="/main/tasks-List" onClick={() => setMenuOpen(false)}>משימות</Link></li>
    <li><Link to="/main/projectHours-List" onClick={() => setMenuOpen(false)}>שעות לפרויקטים</Link></li>
    <li><Link to="/main/conversations-List" onClick={() => setMenuOpen(false)}>יומן שיחות</Link></li>
    {user?.seeFinance && (
            <li><Link to="/main/managerDataMain" onClick={() => setMenuOpen(false)}>נתונים למנהל</Link></li>
      )}
    
    <li onClick={() => { setMenuOpen(false); handleLogout(); }} className="logout">התנתק</li>
  </ul>
  )}

      {/* Main content h-screen overflow-hidden */}
      <main className="main-content ">
        <Routes>
          <Route index element={<Navigate to="report-time" replace />} />
          <Route path="report-time" element={<ReportTime />} />
          <Route path="report-list" element={<ReportList />} />
          <Route path="phone-book-List" element={<BusinessPhonebook />} />
          <Route path="tasks-List" element={<TaskManager />} />
          <Route path="projectHours-List" element={<ProjectHours />} /> 
          <Route path="conversations-List" element={<ConversationList />} /> 
          <Route path="managerDataMain" element={<ManagerDataMain />} />


{/* contacts={dummyData}  */}
          <Route path="home" element={<HomePage />} />
          <Route path="*" element={<Navigate to="report-time" replace />} />
        </Routes>
      </main>
    </div>
     
  );
};

export default MainApp;
