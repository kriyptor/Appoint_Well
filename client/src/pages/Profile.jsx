// src/components/Profile.jsx
import React from 'react';
import { Container, Card, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { currentUser } = useAuth();
  
  return (
    <Container className="mt-4">
      <Card>
        <Card.Header as="h4">User Profile</Card.Header>
        <Card.Body>
          <Card.Title>{currentUser.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{currentUser.email}</Card.Subtitle>
          <Card.Text>
            Role: <Badge bg={
              currentUser.role === 'admin' ? 'danger' : 
              currentUser.role === 'staff' ? 'warning' : 'primary'
            }>{currentUser.role}</Badge>
          </Card.Text>
          <Card.Text>
            This profile page is accessible to all authenticated users, regardless of role.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Profile;