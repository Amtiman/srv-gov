import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';  // REMOVED BrowserRouter
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingThemeProvider } from './context/LandingThemeContext';
import { useDir } from './hooks/useDir';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import ServicesPage from './pages/ServicesPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function AppContent() {
  const { i18n } = useTranslation();
  const { dir, fontFamily } = useDir();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = dir;
    document.body.style.fontFamily = fontFamily;
  }, [i18n.language, dir, fontFamily]);

  return (
    <LandingThemeProvider>
      {/* REMOVED <Router> wrapper from here */}
      <div dir={dir} lang={i18n.language} style={{ minHeight: '100vh', backgroundColor: '#0c1120', fontFamily }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/admin/services" element={<AdminRoute><ServicesPage /></AdminRoute>} />
        </Routes>
      </div>
    </LandingThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;