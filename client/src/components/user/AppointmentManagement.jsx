import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ListGroup, Button, Modal, Nav, Container, Spinner, Alert } from 'react-bootstrap';
import AppointmentCard from './AppointmentCard';
import axios from 'axios';
import RescheduleModal from './RescheduleModal';
import GrockCard from './GrockCard';

const AppointmentManagement = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [appointments, setAppointments] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const { authToken } = useAuth();

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BASE_URL}/appointment/user/all`, {
        headers: { Authorization: authToken }
      });
      setAppointments(response.data.data);
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
        appt.id === id ? { ...appt, status: 'cancelled' } : appt
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
      setShow(true);
    }
  };

  const handleRescheduleSuccess = (updatedAppointment) => {
    setAppointments(appointments.map(appt => 
      appt.id === updatedAppointment.id ? updatedAppointment : appt
    ));
  };

  const filteredAppointments = appointments.filter(appt => {
    const isUpcoming = new Date(appt.date) >= new Date().setHours(0, 0, 0, 0);
    return activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
  });

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mt-3 text-center">My Appointments</h2>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Container className="mt-3">
        <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
          <Nav.Item>
            <Nav.Link eventKey="upcoming">Upcoming Appointments</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="previous">Previous Appointments</Nav.Link>
          </Nav.Item>
        </Nav>
      </Container>

      <div className="mt-3">
        {filteredAppointments.length === 0 ? (
          <p className="text-center text-muted">No {activeTab} appointments found.</p>
        ) : (
          filteredAppointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              id={appt.id}
              title={appt.title}
              date={appt.date}
              time={appt.startTime}
              price={appt.price}
              status={appt.status}
              onCancel={() => handleCancel(appt.id)}
              onReschedule={() => handleReschedule(appt.id)}
            />
          ))
        )}
      </div>

      <RescheduleModal 
        show={show} 
        setShow={setShow} 
        selectedAppt={selectedAppt} 
        onRescheduleSuccess={handleRescheduleSuccess}
      />
    </Container>
  );
};

export default AppointmentManagement;