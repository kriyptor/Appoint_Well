import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import AppointmentBooking from '../components/user/AppointmentBooking';
import Wallet from '../components/user/Wallet';
import ServiceShowcase from '../components/user/ServiceShowcase';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppointmentManagement from '../components/user/AppointmentManagement';

function UserDashboard() {
  const { currentUser } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<AppointmentBooking />} />
        <Route path="/appointments" element={<AppointmentManagement />} />
        <Route path="/services" element={<ServiceShowcase />} />
      </Routes>
      <Wallet />
    </>
  );
}

export default UserDashboard;
