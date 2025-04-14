import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

function UserDashboard() {
  const { currentUser } = useAuth();
  
  return (
    <Container className="mt-4">
      <Card>
        <Card.Header as="h4">User Dashboard</Card.Header>
        <Card.Body>
          <Card.Title>Welcome, {currentUser.name}</Card.Title>
          <Card.Text>
            This is the regular user dashboard. Only users with the 'user' role can access this page.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default UserDashboard;
