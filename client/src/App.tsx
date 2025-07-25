import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
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

            {/* Protected Routes - require authentication */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
                      <p className="text-gray-600">Coming soon - User dashboard with canvas management</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/explore" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Canvases</h1>
                      <p className="text-gray-600">Coming soon - Browse public canvases from the community</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/canvas/new" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Canvas</h1>
                      <p className="text-gray-600">Coming soon - Advanced canvas creation with drawing tools</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/canvas/:id" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">Canvas Viewer</h1>
                      <p className="text-gray-600">Coming soon - View and collaborate on canvases</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings</h1>
                      <p className="text-gray-600">Coming soon - User profile and account settings</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/profile/:username" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">User Profile</h1>
                    <p className="text-gray-600">Coming soon - User profiles with canvas galleries</p>
                  </div>
                </div>
              } 
            />

            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">Page not found</p>
                    <a 
                      href="/" 
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Go back home
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;