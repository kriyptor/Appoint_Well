import React from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';

function AppointmentCard({ title, date, time, price, status, onCancel, onReschedule }) {
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center border-bottom-0 pb-0">
        <div>
          <h5 className="mb-1">{title}</h5>
          <Badge bg={getStatusVariant(status)} className="px-3 py-2 fs-6">
            {status?.toUpperCase()}
          </Badge>
        </div>
        <div>
          <span className="text-primary fw-bold fs-5">
            ₹{price}
          </span>
        </div>
      </Card.Header>

      <Card.Body className="bg-light rounded-bottom">
        <Row className="g-3 align-items-center">
          <Col xs={12} md={4}>
            <div className="mb-2">
              <i className="bi bi-calendar-event me-2"></i>
              <span className="fw-semibold">Date:</span> {date}
            </div>
            <div>
              <i className="bi bi-clock me-2"></i>
              <span className="fw-semibold">Time:</span> {time}
            </div>
          </Col>
          <Col xs={12} md={8} className="text-md-end mt-3 mt-md-0">
            {status !== 'cancelled' ? (
              <div className="btn-group" role="group">
                <Button 
                  variant="outline-warning" 
                  onClick={onReschedule}
                  className="d-flex align-items-center px-4"
                >
                  <i className="bi bi-calendar2-plus me-2"></i>
                  Reschedule
                </Button>
                <Button 
                  variant="outline-danger" 
                  onClick={onCancel}
                  className="d-flex align-items-center px-4"
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </Button>
              </div>
            ) : (
              <span className="text-danger fw-semibold">This appointment is cancelled</span>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default AppointmentCard;