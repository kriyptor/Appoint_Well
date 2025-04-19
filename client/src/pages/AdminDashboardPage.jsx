import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ServiceManagement from '../components/admin/ServiceManagement';
import StaffManagement from '../components/admin/StaffManagement';
import RevenueAnalytics from '../components/admin/RevenueAnalytics';


function AdminDashboard() {
  const { currentUser } = useAuth();
  
  return (
    <Routes>
        <Route path="/" element={<ServiceManagement />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/revenue" element={<RevenueAnalytics />} />
      </Routes>
  );
}

export default AdminDashboard;