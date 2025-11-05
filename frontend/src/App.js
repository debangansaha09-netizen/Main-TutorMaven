import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'sonner';
import './App.css';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import AdminLogin from './pages/AdminLogin';
import TutorDashboard from './pages/TutorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import FindTutors from './pages/FindTutors';
import TutorDetail from './pages/TutorDetail';
import HelpSupport from './pages/HelpSupport';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import MyLearning from './pages/MyLearning';
import ManageStudent from './pages/ManageStudent';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Axios interceptor for auth
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${API}/auth/me`);
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth setUser={setUser} />} />
          <Route path="/admin" element={user?.role === 'admin' ? <Navigate to="/dashboard" /> : <AdminLogin setUser={setUser} />} />
          
          <Route
            path="/dashboard"
            element={
              user ? (
                user.role === 'tutor' ? (
                  <TutorDashboard user={user} logout={logout} />
                ) : user.role === 'student' ? (
                  <StudentDashboard user={user} logout={logout} />
                ) : (
                  <AdminDashboard user={user} logout={logout} />
                )
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          
          <Route path="/find-tutors" element={user ? <FindTutors user={user} logout={logout} /> : <Navigate to="/auth" />} />
          <Route path="/tutor/:id" element={user ? <TutorDetail user={user} logout={logout} /> : <Navigate to="/auth" />} />
          <Route path="/help" element={user ? <HelpSupport user={user} logout={logout} /> : <Navigate to="/auth" />} />
          <Route path="/settings" element={user ? <Settings user={user} logout={logout} /> : <Navigate to="/auth" />} />
          <Route path="/notifications" element={user ? <Notifications user={user} logout={logout} /> : <Navigate to="/auth" />} />
          <Route path="/my-learning" element={user ? <MyLearning user={user} logout={logout} /> : <Navigate to="/auth" />} />
          <Route path="/manage-student/:subscriptionId" element={user ? <ManageStudent user={user} logout={logout} /> : <Navigate to="/auth" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
