import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthContext from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import CitizenDashboard from './components/dashboards/CitizenDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import InchargeDashboard from './components/dashboards/InchargeDashboard';
import Profile from './components/profile/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';

// New Components
import ComplaintForm from './components/complaints/ComplaintForm';
import ComplaintTracking from './components/complaints/ComplaintTracking';
import PropertyVerification from './components/property/PropertyVerification';
import BuildingApproval from './components/building/BuildingApproval';
import DirectCommunication from './components/communication/DirectCommunication';
import AnonymousComplaint from './components/complaints/AnonymousComplaint';

// Survey Components
import SurveyForm from './components/survey/SurveyForm';
import SurveyResults from './components/survey/SurveyResults';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('garun_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('garun_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('garun_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                {user?.email === 'admin@gmail.com' ? <AdminDashboard /> : 
                 user?.email === 'incharge@gmail.com' ? <InchargeDashboard /> : 
                 <CitizenDashboard />}
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Complaint Routes */}
            <Route path="/register-complaint" element={
              <ProtectedRoute>
                <ComplaintForm />
              </ProtectedRoute>
            } />
            
            <Route path="/track-complaint" element={
              <ProtectedRoute>
                <ComplaintTracking />
              </ProtectedRoute>
            } />

            {/* Property Routes */}
            <Route path="/property-verification" element={
              <ProtectedRoute>
                <PropertyVerification />
              </ProtectedRoute>
            } />

            {/* Building Approval Routes */}
            <Route path="/building-approval" element={
              <ProtectedRoute>
                <BuildingApproval />
              </ProtectedRoute>
            } />

            {/* Communication Routes */}
            <Route path="/direct-communication" element={
              <ProtectedRoute>
                <DirectCommunication />
              </ProtectedRoute>
            } />

            {/* Anonymous Complaint Route */}
            <Route path="/anonymous-complaint" element={
              <AnonymousComplaint />
            } />
            
            {/* Survey Routes */}
            <Route path="/survey-form" element={
              <ProtectedRoute>
                <SurveyForm />
              </ProtectedRoute>
            } />
            
            <Route path="/survey-results" element={
              <ProtectedRoute>
                <SurveyResults />
              </ProtectedRoute>
            } />
            
            <Route path="/surveys" element={
              <ProtectedRoute>
                <SurveyResults />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
