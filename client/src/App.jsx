import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navigation from './pages/Navigation';
import AuthInterface from './components/auth/AuthInterface';
import UserDashboard from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import StaffDashboard from './pages/StaffDashboardPage';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Container className="py-3">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<AuthInterface />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes for all authenticated users */}
            <Route element={<ProtectedRoute allowedRoles={['user', 'admin', 'staff']} />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            {/* User-specific routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/user/*" element={<UserDashboard />} />
            </Route>
            
            {/* Admin-specific routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/*" element={<AdminDashboardPage />} />
              {/* Add more admin routes as needed */}
            </Route>
            
            {/* Staff-specific routes */}
            <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
              <Route path="/staff-dashboard" element={<StaffDashboard />} />
              {/* Add more staff routes as needed */}
            </Route>
            
            {/* Default route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;