import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AuthInterface() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { login, signup, authError } = useAuth();
  const navigate = useNavigate();

  // Reset form when switching between sign-in and sign-up
  useEffect(() => {
    resetForm();
  }, [isSignUp]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
    setPhoneNumber('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      if (isSignUp) {
        const isSignedUp = await signup(name, email, password);
        if (isSignedUp) {
          setSuccessMessage("Registration successful! Please log in.");
          setTimeout(() => {
            setIsSignUp(false);
          }, 2000);
        }
      } else {
        const loginSuccess = await login(email, password, role);
        if (loginSuccess && redirectPath) {
          navigate(redirectPath);
        }
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setErrorMessage(error.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card style={{ width: "400px" }}>
        <Card.Body>
          <Card.Title className="text-center text-uppercase">
            {isSignUp ? "Sign Up as User" : "Sign In"}
          </Card.Title>
          {authError && (
            <Alert variant="danger" dismissible onClose={() => setErrorMessage('')}>
              {authError}
            </Alert>
          )}
          {/* {errorMessage && <Alert variant="danger" dismissible onClose={() => setErrorMessage('')}>{errorMessage}</Alert>} */}
          {successMessage && <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
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

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span>Loading...</span>
                </>
              ) : (
                isSignUp ? "Sign Up" : "Sign In"
              )}
            </Button>
          </Form>

          <div className="text-center mt-3">
            {isSignUp ? (
              <span>
                Already have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(false)}
                  disabled={loading}
                >
                  Sign In
                </Button>
              </span>
            ) : (
              <span>
                Don't have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(true)}
                  disabled={loading}
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