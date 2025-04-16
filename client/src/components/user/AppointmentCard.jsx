import React from 'react';
import { Card, Button } from 'react-bootstrap';

function AppointmentCard() {
  return (
    <Card className='mt-4'>
    <Card.Header as="h5">Featured</Card.Header>
    <Card.Body>
      <Card.Title>Special title treatment</Card.Title>
      <Card.Text>
        With supporting text below as a natural lead-in to additional content.
      </Card.Text>
      <Button variant="primary">Go somewhere</Button>
    </Card.Body>
  </Card>
  )
}

export default AppointmentCard