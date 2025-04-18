import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ServiceManagement from '../components/admin/ServiceManagement';



function AdminDashboard() {
  const { currentUser } = useAuth();
  
  return (
    <Routes>
        <Route path="/" element={<ServiceManagement />} />
        {/* <Route path="/appointments" element={<AppointmentManagement />} />
        <Route path="/services" element={<ServiceShowcase />} /> */}
      </Routes>
  );
}

export default AdminDashboard;