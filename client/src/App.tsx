import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWADebugPanel from './components/PWADebugPanel';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import NewCanvas from './pages/NewCanvas';
import CanvasEditor from './pages/CanvasEditor';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  // Register service worker for PWA functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
            <Navbar />
            <main className="flex-1">
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            
            {/* Auth Routes - redirect if already authenticated */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              } 
            />
            
            {/* Contact Route - public */}
            <Route 
              path="/contact" 
              element={
                <ProtectedRoute requireAuth={false} allowAuthenticatedAccess={true}>
                  <Contact />
                </ProtectedRoute>
              } 
            />
            
            {/* Password Reset Routes - public */}
            <Route 
              path="/forgot-password" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <ForgotPassword />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/reset-password/:token" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <ResetPassword />
                </ProtectedRoute>
              } 
            />

            {/* Protected Routes - require authentication */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/explore" 
              element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/canvas/new" 
              element={
                <ProtectedRoute>
                  <NewCanvas />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/canvas/:id" 
              element={
                <CanvasEditor />
              } 
            />

            <Route 
              path="/canvas/:id/edit" 
              element={
                <ProtectedRoute>
                  <CanvasEditor />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/profile/:username" 
              element={<Profile />} 
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </main>
          <Footer />
          <PWAInstallPrompt />
          <PWADebugPanel />
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;