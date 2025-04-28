import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './pages/Navigation';
import AuthInterface from './components/auth/AuthInterface';
import UserDashboard from './pages/UserDashboardPage';
import AdminDashboard from './pages/AdminDashboardPage';
import StaffDashboard from './pages/StaffDashboardPage';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './routes/ProtectedRoute';
import { Container } from 'react-bootstrap';

// Create a separate component to use navigation hooks
function AppContent() {
  const navigate = useNavigate();
  const { redirectPath, setRedirectPath, currentUser } = useAuth();

  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath);
      setRedirectPath(null);
    }
  }, [redirectPath, navigate, setRedirectPath]);

  return (
    <>
      <Navigation />
      <Container className="py-3">
        <Routes>
          <Route path="/login" element={<AuthInterface />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin', 'staff']} />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* User routes */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/user/*" element={<UserDashboard />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>
          
          {/* Staff routes */}
          <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
            <Route path="/staff/*" element={<StaffDashboard />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Container>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;