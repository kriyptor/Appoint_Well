import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Wallet from '../components/user/Wallet';
import UserProfile from '../components/user/UserProfile';
import ServiceShowcase from '../components/user/ServiceShowcase';
import AppointmentBooking from '../components/user/AppointmentBooking';
import UpcomingAppointments from '../components/user/UpcomingAppointments';
import CanceledAppointments from '../components/user/CanceledAppointments';
import PrevoiusAppointments from '../components/user/PrevoiusAppointments';

function UserDashboard() {
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
