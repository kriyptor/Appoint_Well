import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaffProfile from '../components/staff/StaffProfile';
import UpcomingStaffAppointments from '../components/staff/UpcomingStaffAppointments';
import PreviousStaffAppointments from '../components/staff/PreviousStaffAppointments';


function StaffDashboard() {
  return (
    <>
    <Routes>
      <Route path="/" element={<UpcomingStaffAppointments/>} />
      <Route path="/profile" element={<StaffProfile />} />
      <Route path="/appointment/previous" element={<PreviousStaffAppointments/>} />
    </Routes>
  </>
  );
}

export default StaffDashboard;