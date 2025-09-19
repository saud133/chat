import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import ServicesPage from './pages/ServicesPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <Layout>
                <HomePage />
              </Layout>
            } />
            <Route path="/contact" element={
              <ProtectedRoute>
                <Layout>
                  <ContactPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Layout>
                  <ContactPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/services" element={
              <Layout>
                <ServicesPage />
              </Layout>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;