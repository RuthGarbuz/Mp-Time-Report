
//import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

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
