import React from 'react';
import { Container, Card, ListGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const { currentUser } = useAuth();
  
  return (
    <Container className="mt-4">
      <Card>
        <Card.Header as="h4">Admin Dashboard</Card.Header>
        <Card.Body>
          <Card.Title>Welcome, {currentUser.name}</Card.Title>
          <Card.Text>
            This is the admin dashboard. Only users with the 'admin' role can access this page.
          </Card.Text>
          <Card.Text>
            As an admin, you have access to all system functions and can:
          </Card.Text>
          <ListGroup variant="flush">
            <ListGroup.Item>Manage users</ListGroup.Item>
            <ListGroup.Item>View system reports</ListGroup.Item>
            <ListGroup.Item>Configure system settings</ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AdminDashboard;