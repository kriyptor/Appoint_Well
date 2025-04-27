import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ReviewModal = ({ show, setShow, selectedAppt, onReviewSuccess }) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { authToken } = useAuth();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
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

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${BASE_URL}/review/staff/response`,
        { reviewId : selectedAppt.review.id, responseMessage : comment },
        { headers: { Authorization: authToken } }
      );

      setSuccess('Review submitted successfully!');
      onReviewSuccess({ ...selectedAppt, review: { isStaffResponded : true, staffResponse: comment } });
      
      // Close modal after showing success message
      setTimeout(() => {
        handleClose();
      }, 900);
    } catch (error) {
      setError(`Failed to submit review, ${error.response?.data?.message || error.message}`);
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
      <Form>
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
          
          <Form.Group className="mb-3">
            <Form.Label>Appointment:</Form.Label>
            <Form.Control
              type="text"
              value={`${selectedAppt?.serviceTitle} For client: ${selectedAppt?.userName}`}
              readOnly
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Your Reply</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Give your reply here..."
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
          <Button type="submit" variant="primary" onClick={handleSubmit} disabled={loading}>
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