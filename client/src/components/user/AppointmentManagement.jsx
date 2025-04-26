import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Container, Spinner, Alert, Nav, Badge } from 'react-bootstrap';
import AppointmentCard from './AppointmentCard';
import axios from 'axios';
import RescheduleModal from './RescheduleModal';
import ReviewModal from './ReviewModal';

const AppointmentManagement = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { authToken } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BASE_URL}/appointment/user/all`, {
        headers: { Authorization: authToken }
      });
      
      // Add console.log to debug
      console.log('Fetched appointments:', response.data);
      
      // Make sure we're setting the correct data path
      if (response.data && response.data.data) {
        setAppointments(response.data.data);
      } else {
        setError('No appointment data received');
      }
    } catch (error) {
      setError('Failed to fetch appointments. Please try again.');
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [BASE_URL, authToken]);

  const handleCancel = async (id) => {
    try {
      await axios.patch(
        `${BASE_URL}/appointment/cancel/${id}`,
        {},
        { headers: { Authorization: authToken } }
      );
      setAppointments(appointments.map(appt => 
        appt.id === id ? { ...appt, status: 'canceled' } : appt
      ));
    } catch (error) {
      setError('Failed to cancel appointment. Please try again.');
      console.error('Error canceling appointment:', error);
    }
  };

  const handleReschedule = (id) => {
    const appointment = appointments.find((appt) => appt.id === id);
    if (appointment) {
      setSelectedAppt(appointment);
      setShowReschedule(true);
    }
  };

  const handleRescheduleSuccess = (updatedAppointment) => {
    setAppointments(appointments.map(appt => 
      appt.id === updatedAppointment.id ? updatedAppointment : appt
    ));
  };

  const handleReview = (id) => {
    const appointment = appointments.find((appt) => appt.id === id);
    if (appointment) {
      setSelectedAppt(appointment);
      setShowReview(true);
    }
  };

  const handleReviewSuccess = (updatedAppointment) => {
    setAppointments(appointments.map(appt => 
      appt.id === updatedAppointment.id ? updatedAppointment : appt
    ));
  };

  const filteredAppointments = appointments.filter(appt => {
    if (!appt || !appt.date) return false; // Safety check
    
    const todayMidnight = new Date().setHours(0, 0, 0, 0);
    const apptDate = new Date(appt.date).setHours(0, 0, 0, 0);
    
    switch (activeTab) {
      case 'upcoming':
        return (appt.status === 'upcoming' || appt.status === 'rescheduled') && 
               apptDate >= todayMidnight;
      case 'previous':
        return apptDate < todayMidnight && 
               appt.status !== 'canceled';
      case 'canceled':
        return appt.status === 'canceled';
      default:
        return false;
    }
  });

  return (
    <Container className="py-4">
      {/* Add this debug section during development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-3 p-3 border rounded">
          <small>Debug Info:</small>
          <pre className="mb-0">
            {JSON.stringify({
              totalAppointments: appointments.length,
              filteredCount: filteredAppointments.length,
              activeTab,
              loading
            }, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">My Appointments</h2>
        <div className="d-flex gap-2">
          <Badge bg="primary" pill>
            Upcoming: {appointments.filter(a => a.status === 'upcoming').length}
          </Badge>
          <Badge bg="secondary" pill>
            Previous: {appointments.filter(a => a.status !== 'upcoming' && a.status !== 'canceled').length}
          </Badge>
          <Badge bg="danger" pill>
            Canceled: {appointments.filter(a => a.status === 'canceled').length}
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Nav.Item>
          <Nav.Link eventKey="upcoming">
            <i className="bi bi-calendar-check me-1"></i>
            Upcoming
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="previous">
            <i className="bi bi-calendar-x me-1"></i>
            Previous
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="canceled">
            <i className="bi bi-calendar-minus me-1"></i>
            Canceled
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-2">Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-calendar-x display-1 text-muted"></i>
          <p className="text-muted mt-3">
            No {activeTab} appointments found.
          </p>
        </div>
      ) : (
        <div className="appointment-list">
          {filteredAppointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              {...appt}
              activeTab={activeTab}
              onCancel={() => handleCancel(appt.id)}
              onReschedule={() => handleReschedule(appt.id)}
              onReview={() => handleReview(appt.id)}
            />
          ))}
        </div>
      )}

      <RescheduleModal
        show={showReschedule}
        setShow={setShowReschedule}
        selectedAppt={selectedAppt}
        onRescheduleSuccess={handleRescheduleSuccess}
      />
      <ReviewModal
        show={showReview}
        setShow={setShowReview}
        selectedAppt={selectedAppt}
        onReviewSuccess={handleReviewSuccess}
      />
    </Container>
  );
};

export default AppointmentManagement;