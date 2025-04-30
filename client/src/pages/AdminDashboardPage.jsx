import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminProfile from '../components/admin/AdminProfile';
import StaffManagement from '../components/admin/StaffManagement';
import RevenueAnalytics from '../components/admin/RevenueAnalytics';
import ServiceManagement from '../components/admin/ServiceManagement';
import UpcomingAllAppointment from '../components/admin/UpcomingAllAppointment';
import CanceledAllAppointments from '../components/admin/CanceledAllAppointments';
import PreviousAllAppointments from '../components/admin/PreviousAllAppointments';


function AdminDashboard() {
  const { currentUser } = useAuth();
  
  return (
    <Routes>
        <Route path="/profile" element={<AdminProfile/>} />
        <Route path="/" element={<ServiceManagement />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/revenue" element={<RevenueAnalytics />} />
        <Route path="/appointment/upcoming" element={<UpcomingAllAppointment />} />
        <Route path="/appointment/previous" element={<PreviousAllAppointments/>} />
        <Route path="/appointment/cancelled" element={<CanceledAllAppointments/>} />
      </Routes>
  );
}

export default AdminDashboard;