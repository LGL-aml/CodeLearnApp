import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './components/homepage/HomePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Profile from './components/auth/Profile';
import ChangePassword from './components/auth/ChangePassword';
import CoursesList from './components/courses/CoursesList';
import CourseDetail from './components/courses/CourseDetail';
import CourseLearning from './components/courses/CourseLearning';
import CourseCertificate from './components/courses/CourseCertificate';
import CourseQuiz from './components/courses/CourseQuiz';

import AlertNotification from './components/common/AlertNotification';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AlertNotification />
      <Routes>
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        <Route path="/login" element={
          <Layout>
            <Login />
          </Layout>
        } />
        <Route path="/register" element={
          <Layout>
            <Register />
          </Layout>
        } />
        <Route path="/forgot-password" element={
          <Layout>
            <ForgotPassword />
          </Layout>
        } />
        <Route path="/profile" element={
          <Layout>
            <Profile />
          </Layout>
        } />
        <Route path="/change-password" element={
          <Layout>
            <ChangePassword />
          </Layout>
        } />
        <Route path="/courses" element={
          <Layout>
            <CoursesList />
          </Layout>
        } />
        <Route path="/courses/:id" element={
          <Layout>
            <CourseDetail />
          </Layout>
        } />
        <Route path="/courses/:id/learn" element={
          <Layout>
            <CourseLearning />
          </Layout>
        } />
        <Route path="/courses/:id/quiz" element={
          <Layout>
            <CourseQuiz />
          </Layout>
        } />
        <Route path="/courses/:courseId/cert/:userId" element={
          <Layout>
            <CourseCertificate />
          </Layout>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App