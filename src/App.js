import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import ChatPage from './pages/ChatPage';
import ServicesPage from './pages/ServicesPage';
import ProtectedRoute from './components/ProtectedRoute';

// صفحات الدخول والتسجيل
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>

            {/* الصفحة الرئيسية */}
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />

            {/* صفحات عامة */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* صفحات محمية */}
            <Route
              path="/contact"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ContactPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChatPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/services"
              element={
                <Layout>
                  <ServicesPage />
                </Layout>
              }
            />

          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
