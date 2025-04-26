import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ReviewModal = ({ show, setShow, selectedAppt, onReviewSuccess }) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { authToken } = useAuth();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setRating(5);
      setComment('');
      setError('');
      setSuccess('');
    }
  }, [show]);

  const handleClose = () => {
    setShow(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${BASE_URL}/appointment/review/${selectedAppt.id}`,
        { rating, comment },
        { headers: { Authorization: authToken } }
      );

      setSuccess('Review submitted successfully!');
      onReviewSuccess({ ...selectedAppt, review: { rating, comment } });
      
      // Close modal after showing success message
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setError('Failed to submit review. Please try again.');
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Write a Review</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}
          
          <div className="mb-4">
            <h6>Service Details:</h6>
            <p className="text-muted mb-0">
              {selectedAppt?.serviceName}<br />
              Staff: {selectedAppt?.staffName}
            </p>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Rating</Form.Label>
            <div className="d-flex align-items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`bi bi-star${rating >= star ? '-fill' : ''} fs-4 me-2`}
                  style={{ cursor: 'pointer', color: rating >= star ? '#ffc107' : '#dee2e6' }}
                  onClick={() => setRating(star)}
                ></i>
              ))}
              <span className="ms-2 text-muted">({rating} out of 5)</span>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Your Review</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ReviewModal;