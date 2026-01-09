import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import CustomerDashboard from './components/CustomerDashboard';
import AdminDashboard from './components/AdminDashboard';
import LoanApplication from './components/LoanApplication';
import MyLoans from './components/MyLoans';
import InstallPrompt from './components/InstallPrompt';
import OfflineDetector from './components/OfflineDetector';
import Loading from './components/Loading';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loading message="Loading your account..." />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              {user?.role === 'admin' ? <AdminDashboard /> : <CustomerDashboard />}
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/apply" 
          element={
            <PrivateRoute requiredRole="customer">
              <LoanApplication />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/my-loans" 
          element={
            <PrivateRoute requiredRole="customer">
              <MyLoans />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <PrivateRoute requiredRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <OfflineDetector />
      <AppRoutes />
      <InstallPrompt />
    </AuthProvider>
  );
}

export default App;
