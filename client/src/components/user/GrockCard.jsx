import React from 'react';
import { Card, Button, Image, Row, Col } from 'react-bootstrap';

const AppointmentCard = () => {
  // Mock data
  const appointment = {
    dateTime: '2025-04-25 10:30 AM',
    staffName: 'Dr. Priya Sharma',
    amountPaid: 1500, // INR
    staffImage: 'https://via.placeholder.com/100', // Placeholder image
  };

  // Handle button clicks (replace with actual logic)
  const handleReschedule = () => {
    console.log('Reschedule appointment clicked');
    // Add reschedule logic here
  };

  const handleCancel = () => {
    console.log('Cancel appointment clicked');
    // Add cancel logic here
  };

  return (
    <Card style={{ margin: '20px auto' }} className="shadow-sm">
      <Card.Body>
        <Card.Title className="fw-bold">Appointment Details</Card.Title>
        <Row className="align-items-center mb-3">
          <Col xs={4}>
            <Image
              src={appointment.staffImage}
              roundedCircle
              fluid
              alt={appointment.staffName}
              style={{ width: '80px', height: '80px' }}
            />
          </Col>
          <Col xs={8}>
            <Card.Subtitle className="mb-2 text-muted">
              {appointment.staffName}
            </Card.Subtitle>
            <Card.Text className="mb-1">
              <strong>Date & Time:</strong> {appointment.dateTime}
            </Card.Text>
            <Card.Text className="mb-1">
              <strong>Amount Paid:</strong> ₹{appointment.amountPaid}
            </Card.Text>
          </Col>
        </Row>
        <div className="d-flex justify-content-between">
          <Button variant="primary" onClick={handleReschedule}>
            Reschedule
          </Button>
          <Button variant="danger" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AppointmentCard;