import React, { useState } from 'react';
import { Link, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import ReportTime from './ReportTime';
import ReportList from './ReportList';


// import '../App.css';
import HomePage from './HomePage';
import type {  MainAppProps } from '../interface/interfaces';
import '../index.css';
import "tailwindcss";
import BusinessPhonebook from './BusinessPhonebook';
const MainApp: React.FC<MainAppProps> = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };


  return (
    
    <div className="main-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-title">
            <img src="/favicon.ico" alt="Logo" className="nav-icon" />
              Time Report
        </div>

        {/* Desktop menu */}
        <ul className="desktop-menu">
          <li onClick={handleLogout} className="logout">התנתק</li>
          <li><Link to="/main/report-list">רשימת דיווחים</Link></li>
          <li><Link to="/main/report-time">דיווח נכחות</Link></li>
          <li><Link to="/main/phone-book-List">אלפון</Link></li>

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
    
    <li onClick={() => { setMenuOpen(false); handleLogout(); }} className="logout">התנתק</li>
  </ul>
  )}

      {/* Main content */}
      <main className="main-content">
        <Routes>
          <Route index element={<Navigate to="report-time" replace />} />
          <Route path="report-time" element={<ReportTime />} />
          <Route path="report-list" element={<ReportList />} />
          <Route path="phone-book-List" element={<BusinessPhonebook />} />
{/* contacts={dummyData}  */}
          <Route path="home" element={<HomePage />} />
          <Route path="*" element={<Navigate to="report-time" replace />} />
        </Routes>
      </main>
      
    </div>
     
  );
};

export default MainApp;
