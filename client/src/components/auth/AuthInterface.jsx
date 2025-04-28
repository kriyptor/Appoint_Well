// src/components/AuthInterface.jsx
import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AuthInterface() {
  // State to toggle between sign-in and sign-up modes
  const [isSignUp, setIsSignUp] = useState(false);
  // States for form fields
  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const { login, signup, authError } = useAuth();
  const navigate = useNavigate();

  // Function to reset form fields when switching modes
  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignUp) {
      await signup(name, email, password, phoneNumber);
    } else {
      await login(email, password, role);
    }
    // Remove navigation logic from here
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card style={{ width: "400px" }}>
        <Card.Body>
          {/* Dynamic title based on mode */}
          <Card.Title className="text-center text-uppercase">
            {isSignUp ? "Sign Up as User" : "Sign In"}
          </Card.Title>

          {/* Display auth errors */}
          {authError && <Alert variant="danger">{authError}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Name field (only for sign-up) */}
            {isSignUp && (
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
            )}

            {/* Role selection (only for sign-in) */}
            {!isSignUp && (
              <Form.Group controlId="formRole" className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  as="select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </Form.Control>
              </Form.Group>
            )}

            {/* Email field (common to both) */}
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            {/* Role selection (only for sign-Up) */}
            {isSignUp && (
              <Form.Group controlId="formPhoneNumber" className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter your Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </Form.Group>
            )}

            {/* Password field (common to both) */}
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            {/* Submit button */}
            <Button variant="primary" type="submit" className="w-100">
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </Form>

          {/* Toggle between sign-in and sign-up */}
          <div className="text-center mt-3">
            {isSignUp ? (
              <span>
                Already have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => {
                    setIsSignUp(false);
                    resetForm();
                  }}
                >
                  Sign In
                </Button>
              </span>
            ) : (
              <span>
                Don't have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => {
                    setIsSignUp(true);
                    resetForm();
                  }}
                >
                  Sign Up
                </Button>
              </span>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AuthInterface;