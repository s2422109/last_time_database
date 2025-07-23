import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // ★ 追加
import UploadPage from './pages/UploadPage';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="app-container">
      <Header />
      <div className="content-container">
        <Routes>
          {/* --- 公開ルート --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> {/* ★ 追加 */}

          {/* --- 保護されたルート --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/map" element={<MapPage />} />
            <Route path="/upload" element={<UploadPage />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;