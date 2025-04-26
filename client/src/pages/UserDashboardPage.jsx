import React from 'react';
import { useAuth } from '../context/AuthContext';
import AppointmentBooking from '../components/user/AppointmentBooking';
import Wallet from '../components/user/Wallet';
import ServiceShowcase from '../components/user/ServiceShowcase';
import { Routes, Route } from 'react-router-dom';
import AppointmentManagement from '../components/user/AppointmentManagement';
import UserProfile from '../components/user/UserProfile';
import UpcomingAppointments from '../components/user/UpcomingAppointments';
import CanceledAppointments from '../components/user/CanceledAppointments';
import PrevoiusAppointments from '../components/user/PrevoiusAppointments';

function UserDashboard() {
  const { currentUser } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<AppointmentBooking />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/appointment/upcoming" element={<UpcomingAppointments/>} />
        <Route path="/appointment/previous" element={<PrevoiusAppointments/>} />
        <Route path="/appointment/cancelled" element={<CanceledAppointments/>} />
        <Route path="/services" element={<ServiceShowcase />} />
      </Routes>
      <Wallet />
    </>
  );
}

export default UserDashboard;
