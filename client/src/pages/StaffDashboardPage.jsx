import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaffProfile from '../components/staff/StaffProfile';
import UpcomingStaffAppointments from '../components/staff/UpcomingStaffAppointments';
import PrevoiusStaffAppointCard from '../components/staff/PrevoiusStaffAppointCard';
import CanceledStaffAppointments from '../components/staff/CanceledStaffAppointments';

function StaffDashboard() {
  return (
    <>
    <Routes>
      <Route path="/" element={<UpcomingStaffAppointments/>} />
      <Route path="/profile" element={<StaffProfile />} />
      <Route path="/appointment/previous" element={<PrevoiusStaffAppointCard/>} />
      <Route path="/appointment/cancelled" element={<CanceledStaffAppointments/>} />
    </Routes>
  </>
  );
}

export default StaffDashboard;