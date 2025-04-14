import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Unauthorized() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Redirect to appropriate dashboard based on user role
  const goToDashboard = () => {
    switch(currentUser.role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'staff':
        navigate('/staff-dashboard');
        break;
      default:
        navigate('/user-dashboard');
    }
  };
  
  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Access Denied</Alert.Heading>
        <p>
          You do not have permission to access this page. 
          Your current role ({currentUser.role}) does not have the required permissions.
        </p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button variant="outline-danger" onClick={goToDashboard}>
            Go to Dashboard
          </Button>
        </div>
      </Alert>
    </Container>
  );
}

export default Unauthorized;