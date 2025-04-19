// src/components/Navigation.jsx
import React, { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { currentUser, logout, hasRole, setModalShow } = useAuth();
  const homeNav = `${currentUser?.role}-dashboard`;
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  

  return (
    <Navbar bg="primary" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to={homeNav}>AppointWell</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser ? (
              <>
                {/* Common pages for all authenticated users */}
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                
                {/* User-specific routes */}
                {hasRole('user') && (
                  <>
                  {/* <Nav.Link as={Link} to="/user-dashboard/">User Dashboard</Nav.Link> */}
                  <Nav.Link as={Link} to="/user-dashboard/">Book</Nav.Link>
                  <Nav.Link as={Link} to="/user-dashboard/appointments">Appointments</Nav.Link>
                  <Nav.Link as={Link} to="/user-dashboard/services">Services</Nav.Link>
                  <Button onClick={() => setModalShow(true)} variant="success">Wallet</Button>
                  </>
                )}
                
                {/* Staff-specific routes */}
                {hasRole('staff') && (
                  <Nav.Link as={Link} to="/staff-dashboard">Staff Dashboard</Nav.Link>
                )}
                
                {/* Admin-specific routes */}
                {hasRole('admin') && (
                  <>
                    <Nav.Link as={Link} to="/admin-dashboard">Admin Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/admin-dashboard/staff">Manage Staff</Nav.Link>
                    <Nav.Link as={Link} to="/admin-dashboard/revenue">Revenue Analytics</Nav.Link>
                  </>
                )}
              </>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
          
          {currentUser && (
            <Nav>
              <Navbar.Text className="me-3">
                Hi!, <strong>{currentUser.name}</strong>
              </Navbar.Text>
              {/* {currentUser.role === 'user' && <Button onClick={() => setModalShow(true)} variant="success">Wallet</Button>} */}
              <Button variant="danger" onClick={handleLogout}>Logout</Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;