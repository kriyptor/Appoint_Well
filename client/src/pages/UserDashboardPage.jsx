import React from 'react';
import { useAuth } from '../context/AuthContext';
import AppointmentBooking from '../components/user/AppointmentBooking';
import Wallet from '../components/user/Wallet';
import ServiceShowcase from '../components/user/ServiceShowcase';
import { Routes, Route } from 'react-router-dom';
import AppointmentManagement from '../components/user/AppointmentManagement';
import UserProfile from '../components/user/UserProfile';

function UserDashboard() {
  const { currentUser } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<AppointmentBooking />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/appointments" element={<AppointmentManagement />} />
        <Route path="/services" element={<ServiceShowcase />} />
      </Routes>
      <Wallet />
    </>
  );
}

export default UserDashboard;
