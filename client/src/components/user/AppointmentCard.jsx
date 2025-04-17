import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext'; 


function AppointmentCard({ title, date, time, price, onCancel, onReschedule }) {
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const { authToken } = useAuth();



  return (
    <Card className='mt-4 text-center'>
    <Card.Header as="h5" className='bg-primary'>Appointment</Card.Header>
    <Card.Body>
      <Card.Title>{title}</Card.Title>
      <Card.Text>
        Date:{date} <br />
        Time:{time} <br />
        Price:{price}
      </Card.Text>
     <div className='d-flex align-items-center justify-content-between'>
     <Button variant="warning" onClick={onReschedule}>Reschedule</Button>
     <Button variant="danger" onClick={onCancel}>Cancel</Button>
     </div>
    </Card.Body>
  </Card>
  )
}

export default AppointmentCard