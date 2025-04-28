import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function StaffProfileModal({ show, setShowModal, staff, setUserData }) {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [form, setForm] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { authToken } = useAuth();
  
    const handleClose = () => {
      setShowModal(false);
      setError('');
      setSuccess('');
      setPassword('');
    };
  
    useEffect(() => {
      setForm(staff || {});
      setPassword('');
      setError('');
      setSuccess('');
    }, [staff, show]);
  
    const handleChange = (e) => {
      setForm((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    };
  
    const handleUpdate = async () => {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const { name, email, profilePicture } = form;
        await axios.post(`${BASE_URL}/auth/staff/update`,
          { password, profilePicture },
          { headers: { Authorization: authToken } }
        );
        setSuccess('Profile updated successfully!');
        setUserData({ ...form, password: undefined });
        
        // Delay the modal close to show success message
        setTimeout(() => {
          handleClose();
        }, 900); 
        
      } catch (error) {
        setError('Error updating user data. Please try again.');
        console.error('Error updating user data:', error);
      } finally {
        setLoading(false);
        setPassword('');
      }
    };
  
    return (
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Staff Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                name="password"
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control
                name="profilePicture"
                type="text"
                value={form.profilePicture || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">Updating...</span>
              </>
            ) : (
              'Update'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    );
}

export default StaffProfileModal