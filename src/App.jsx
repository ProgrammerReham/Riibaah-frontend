import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/Dashboard';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyber-neon-cyan to-cyber-neon-pink rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-cyber-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-cyber-neon-cyan mb-2">
            Initializing RiiZaa...
          </h2>
          <p className="text-cyber-light-gray">
            Connecting to the cyberpunk realm
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyber-neon-cyan to-cyber-neon-pink rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-cyber-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-cyber-neon-cyan mb-2">
            Loading RiiZaa...
          </h2>
          <p className="text-cyber-light-gray">
            Preparing the cyberpunk experience
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#ffffff',
                border: '1px solid #333333',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#00ff41',
                  secondary: '#0a0a0a',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff6600',
                  secondary: '#0a0a0a',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

