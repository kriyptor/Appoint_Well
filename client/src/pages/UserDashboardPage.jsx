import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import AppointmentBooking from '../components/user/AppointmentBooking';
import Wallet from '../components/user/Wallet';

function UserDashboard() {
  const { currentUser } = useAuth();
  
  return (
    <>
    <AppointmentBooking/>
    <Wallet/>
    </>
  );
}

export default UserDashboard;
