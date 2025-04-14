// src/components/Navigation.jsx
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { currentUser, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <Navbar bg="primary" expand="lg" >
      <Container>
        <Navbar.Brand as={Link} to="/">AppointWell</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser ? (
              <>
                {/* Common pages for all authenticated users */}
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                
                {/* User-specific routes */}
                {hasRole('user') && (
                  <Nav.Link as={Link} to="/user-dashboard">User Dashboard</Nav.Link>
                )}
                
                {/* Staff-specific routes */}
                {hasRole('staff') && (
                  <Nav.Link as={Link} to="/staff-dashboard">Staff Dashboard</Nav.Link>
                )}
                
                {/* Admin-specific routes */}
                {hasRole('admin') && (
                  <>
                    <Nav.Link as={Link} to="/admin-dashboard">Admin Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/manage-users">Manage Users</Nav.Link>
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
                Signed in as: <strong>{currentUser.name}</strong> ({currentUser.role})
              </Navbar.Text>
              <Button variant="danger" onClick={handleLogout}>Logout</Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;