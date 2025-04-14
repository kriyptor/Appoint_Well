import React from 'react';
import { Container, Card, ListGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

function StaffDashboard() {
  const { currentUser } = useAuth();
  
  return (
    <Container className="mt-4">
      <Card>
        <Card.Header as="h4">Staff Dashboard</Card.Header>
        <Card.Body>
          <Card.Title>Welcome, {currentUser.name}</Card.Title>
          <Card.Text>
            This is the staff dashboard. Only users with the 'staff' role can access this page.
          </Card.Text>
          <Card.Text>
            As a staff member, you can:
          </Card.Text>
          <ListGroup variant="flush">
            <ListGroup.Item>Access customer information</ListGroup.Item>
            <ListGroup.Item>Manage support tickets</ListGroup.Item>
            <ListGroup.Item>View staff reports</ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default StaffDashboard;