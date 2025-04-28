// src/components/Navigation.jsx
import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { currentUser, logout, hasRole, setModalShow } = useAuth();
  const homeNav = `${currentUser?.role}`;
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  

  return (
    <Navbar bg="primary" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to={homeNav}>
          AppointWell
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser ? (
              <>
                {/* User-specific routes */}
                {hasRole("user") && (
                  <>
                    {/* <Nav.Link as={Link} to="/user-dashboard/">User Dashboard</Nav.Link> */}
                    <Nav.Link as={Link} to="/user/profile">
                      Profile
                    </Nav.Link>
                    <Nav.Link as={Link} to="/user/">
                      Book
                    </Nav.Link>
                      <NavDropdown title="Your Appointments" id="basic-nav-dropdown">
                        <NavDropdown.Item as={Link} to="/user/appointment/upcoming">
                          Upcoming Appointments
                        </NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/user/appointment/previous">
                          Previous Appointments
                        </NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/user/appointment/cancelled">
                          Canceled Appointments
                        </NavDropdown.Item>
                      </NavDropdown>
                    <Nav.Link as={Link} to="/user/services">
                      Services
                    </Nav.Link>
                    <Button
                      onClick={() => setModalShow(true)}
                      variant="success"
                    >
                      Wallet
                    </Button>
                  </>
                )}

                {/* Staff-specific routes */}
                {hasRole("staff") && (
                  <>
                  <Nav.Link as={Link} to="/staff/profile">
                    Profile
                  </Nav.Link>
                  <Nav.Link as={Link} to="/staff/">
                    Upcoming Appointments
                  </Nav.Link>
                  <Nav.Link as={Link} to="/staff/appointment/previous">
                    Previous Appointments
                  </Nav.Link>
                  </>
                )}

                {/* Admin-specific routes */}
                {hasRole("admin") && (
                  <>
                    <Nav.Link as={Link} to="/admin/profile">
                      Profile
                    </Nav.Link>
                    <NavDropdown title="Appointments" id="basic-nav-dropdown">
                        <NavDropdown.Item as={Link} to="/admin/appointment/upcoming">
                          Upcoming Appointments
                        </NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/admin/appointment/previous">
                          Previous Appointments
                        </NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/admin/appointment/cancelled">
                          Canceled Appointments
                        </NavDropdown.Item>
                      </NavDropdown>
                    <Nav.Link as={Link} to="/admin">
                      Manage Services
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/staff">
                      Manage Staffs
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/revenue">
                      Revenue Analytics
                    </Nav.Link>
                  </>
                )}
              </>
            ) : (
              <Nav.Link as={Link} to="/login">
                Login
              </Nav.Link>
            )}
          </Nav>

          {currentUser && (
            <Nav>
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;