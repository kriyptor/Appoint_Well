import React from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { format } from 'date-fns';

const AppointmentCard = ({
  id,
  date,
  time,
  price,
  status = 'upcoming',  // provide defaults
  serviceName = 'Service',
  staffName = 'Staff Member',
  staffProfilePicture,
  review,
  staffResponse,
  activeTab,
  onCancel,
  onReschedule,
  onReview
}) => {
  const formattedDate = date ? format(new Date(date), 'MMM dd, yyyy') : 'Date not set';
  
  const renderStatusBadge = () => {
    switch (status) {
      case 'upcoming':
        return <Badge bg="primary">Upcoming</Badge>;
      case 'rescheduled':
        return <Badge bg="warning">Rescheduled</Badge>;
      case 'canceled':
        return <Badge bg="danger">Canceled</Badge>;
      default:
        return <Badge bg="secondary">Previous</Badge>;
    }
  };

  const renderButtons = () => {
    if (activeTab === 'upcoming') {
      return (
        <div className="d-flex justify-content-end gap-2">
          <Button variant="outline-warning" onClick={onReschedule}>
            <i className="bi bi-calendar2-check me-1"></i>
            Reschedule
          </Button>
          <Button variant="outline-danger" onClick={onCancel}>
            <i className="bi bi-x-circle me-1"></i>
            Cancel
          </Button>
        </div>
      );
    } else if (activeTab === 'previous' && !review) {
      return (
        <Button variant="outline-primary" onClick={onReview}>
          <i className="bi bi-star me-1"></i>
          Complete & Review
        </Button>
      );
    }
    return null;
  };

  return (
    <Card className={`mb-3 shadow-sm ${status === 'canceled' ? 'bg-light' : ''}`}>
      <Card.Body>
        <Row>
          <Col md={2} className="text-center mb-3 mb-md-0">
            <img
              src={staffProfilePicture || 'https://via.placeholder.com/100'}
              alt="Staff"
              className="rounded-circle"
              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
            />
            <div className="mt-2 text-muted small">{staffName}</div>
          </Col>
          <Col md={7}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h5 className="mb-0">{serviceName}</h5>
              {renderStatusBadge()}
            </div>
            <div className="text-muted mb-2">
              <i className="bi bi-calendar2 me-2"></i>
              {formattedDate} at {time}
            </div>
            <div className="d-flex gap-4">
              <div>
                <i className="bi bi-person me-2"></i>
                {staffName}
              </div>
              <div>
                <i className="bi bi-currency-dollar me-1"></i>
                {price}
              </div>
            </div>
          </Col>
          <Col md={3} className="text-end">
            {renderButtons()}
          </Col>
        </Row>

        {review && (
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex align-items-center mb-2">
              <h6 className="mb-0 me-2">Review</h6>
              <div className="text-warning">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>
            </div>
            <p className="mb-2 text-muted">{review.comment}</p>
            {staffResponse && (
              <div className="bg-light p-3 rounded">
                <small className="text-primary fw-bold">Staff Response:</small>
                <p className="mb-0 mt-1">{staffResponse}</p>
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AppointmentCard;