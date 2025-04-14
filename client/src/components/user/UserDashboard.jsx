import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Routes, Route, Link } from 'react-router-dom';
import AppointmentBooking from './AppointmentBooking';
import ServiceShowcase from './ServiceShowcase';
import AppointmentManagement from './AppointmentManagement';
import Wallet from './Wallet';

const UserDashboard = () => (
  <Container>
    <Row>
      <Col md={3}>
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/user/dashboard/book">Book Appointment</Nav.Link>
          <Nav.Link as={Link} to="/user/dashboard/services">Services</Nav.Link>
          <Nav.Link as={Link} to="/user/dashboard/appointments">Appointments</Nav.Link>
          <Nav.Link as={Link} to="/user/dashboard/wallet">Wallet</Nav.Link>
        </Nav>
      </Col>
      <Col md={9}>
        <Routes>
          <Route path="book" element={<AppointmentBooking />} />
          <Route path="services" element={<ServiceShowcase />} />
          <Route path="appointments" element={<AppointmentManagement />} />
          <Route path="wallet" element={<Wallet />} />
        </Routes>
      </Col>
    </Row>
  </Container>
);

export default UserDashboard;