import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HeaderAdmin from './layout/Header';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import HeaderStaff from './layout/HeaderStaff';
import CourseManagement from './pages/staff/CourseManagement';
import ProfilePage from './pages/ProfilePage';
import ChangePassword from './pages/ChangePassword';
import './App.css';

function App() {
  
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <>
                <HeaderAdmin userName="Admin" />
                <main className="content">
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="change-password" element={<ChangePassword />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </main>
              </>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/*"
            element={
              <>
                <HeaderStaff userName="Staff" />
                <main className="content">
                  <Routes>
                    <Route path="courses" element={<CourseManagement />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="change-password" element={<ChangePassword />} />
                    <Route path="*" element={<Navigate to="/staff/courses" replace />} />
                  </Routes>
                </main>
              </>
            }
          />

          {/* Default Route: chuyển hướng về /admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
