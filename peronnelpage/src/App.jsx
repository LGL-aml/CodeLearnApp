import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HeaderAdmin from './layout/Header';
import Login from './pages/Login';
import UserManagement from './pages/admin/UserManagement';
import TopicManagement from './pages/admin/TopicManagement';
import HeaderStaff from './layout/HeaderStaff';
import CourseManagement from './pages/staff/CourseManagement';
import CreateCourse from './pages/staff/CreateCourse';
import EditCourse from './pages/staff/EditCourse';
import ProfilePage from './pages/ProfilePage';
import { getUserInfo, isAuthenticated, checkAndRefreshToken } from './utils/auth';
import { getPageTitleFromPath, setPageTitle } from './utils/pageTitle';
import './App.css';

// Page title component
const PageTitle = () => {
  const location = useLocation();
  
  useEffect(() => {
    const pageTitle = getPageTitleFromPath(location.pathname);
    setPageTitle(pageTitle);
  }, [location]);
  
  return null;
};

// Protected Route component
const ProtectedRoute = ({ children, allowedRole }) => {
  const userInfo = getUserInfo();
  const authenticated = isAuthenticated();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(authenticated);
  
  // Check authentication status when component mounts
  useEffect(() => {
    const verifyAuth = async () => {
      if (authenticated) {
        // Verify token is valid
        const isValid = await checkAndRefreshToken();
        setIsAuth(isValid);
      } else {
        setIsAuth(false);
      }
      setChecking(false);
    };
    
    verifyAuth();
  }, [authenticated]);
  
  // Show loading while checking authentication
  if (checking) {
    return <div className="loading-container">Checking authentication...</div>;
  }
  
  // Check if user is authenticated
  if (!isAuth) {
    // Redirect to login with the return url
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // If allowedRole is specified, check if user has that role
  if (allowedRole && userInfo?.role) {
    const userRole = userInfo.role.toUpperCase();
    const requiredRole = allowedRole.toUpperCase();
    
    if (!userRole.includes(requiredRole)) {
      // If user doesn't have the required role, redirect to appropriate dashboard
      if (userRole.includes('ADMIN')) {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole.includes('LECTURER')) {
        return <Navigate to="/staff/courses" replace />;
      } else {
        // If user has neither role, logout and redirect to login
        return <Navigate to="/login" replace />;
      }
    }
  }
  
  // If authenticated and has correct role, render the children
  return children;
};

function App() {
  const [userInfo, setUserInfo] = useState(getUserInfo());

  useEffect(() => {
    // Listen for user info updates
    const handleUserInfoUpdate = () => {
      setUserInfo(getUserInfo());
    };
    
    window.addEventListener('user-info-updated', handleUserInfoUpdate);
    
    // Check authentication on app load
    const checkAuth = async () => {
      if (isAuthenticated()) {
        await checkAndRefreshToken();
      }
    };
    
    checkAuth();
    
    return () => {
      window.removeEventListener('user-info-updated', handleUserInfoUpdate);
    };
  }, []);

  // Function to update user info (passed to Login component)
  const updateUserInfo = () => {
    setUserInfo(getUserInfo());
  };
  
  return (
    <Router>
      <PageTitle />
      <div className="app">
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<Login updateUserInfo={updateUserInfo} />} />

          {/* Admin Routes - Protected for ADMIN role */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <>
                  <HeaderAdmin userName={userInfo?.fullName || "Admin"} />
                  <main className="content">
                    <Routes>
                      <Route path="users" element={<UserManagement />} />
                      <Route path="topics" element={<TopicManagement />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="*" element={<Navigate to="/admin/users" replace />} />
                    </Routes>
                  </main>
                </>
              </ProtectedRoute>
            }
          />

          {/* Lecturer Routes - Protected for LECTURER role */}
          <Route
            path="/staff/*"
            element={
              <ProtectedRoute allowedRole="LECTURER">
                <>
                  <HeaderStaff userName={userInfo?.fullName || "Lecturer"} />
                  <main className="content">
                    <Routes>
                      <Route path="courses" element={<CourseManagement />} />
                      <Route path="courses/create" element={<CreateCourse />} />
                      <Route path="courses/edit/:id" element={<EditCourse />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="*" element={<Navigate to="/staff/courses" replace />} />
                    </Routes>
                  </main>
                </>
              </ProtectedRoute>
            }
          />

          {/* Default Route: chuyển hướng về /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
