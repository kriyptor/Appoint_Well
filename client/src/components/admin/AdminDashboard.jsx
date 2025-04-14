import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Routes, Route, Link } from 'react-router-dom';
import RevenueAnalytics from './RevenueAnalytics';
import StaffManagement from './StaffManagement';
import ServiceManagement from './ServiceManagement';

const AdminDashboard = () => (
  <Container>
    <Row>
      <Col md={3}>
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/admin/dashboard/revenue">Revenue Analytics</Nav.Link>
          <Nav.Link as={Link} to="/admin/dashboard/staff">Staff Management</Nav.Link>
          <Nav.Link as={Link} to="/admin/dashboard/services">Service Management</Nav.Link>
        </Nav>
      </Col>
      <Col md={9}>
        <Routes>
          <Route path="revenue" element={<RevenueAnalytics />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="services" element={<ServiceManagement />} />
        </Routes>
      </Col>
    </Row>
  </Container>
);

export default AdminDashboard;