

// export default App
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainApp from './pages/MainApp';
import PrivateRoute from './components/PrivateRoute'; // ייבוא חדש
import 'leaflet/dist/leaflet.css';
// import './index.css';
// import './styles/global.css';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* עטוף את MainApp ב-PrivateRoute */}
        <Route
          path="/main/*"
          element={
            <PrivateRoute>
              <MainApp />
            </PrivateRoute>
          }
        />

        {/* ברירת מחדל להפניה */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
   
  );
}

export default App;
