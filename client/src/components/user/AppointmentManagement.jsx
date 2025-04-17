import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ListGroup, Button, Modal, Nav, Container } from 'react-bootstrap';
import AppointmentCard from './AppointmentCard';
import axios from 'axios';

const AppointmentManagement = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  //const [appointments, setAppointments] = useState([]);
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const { appointments, setAppointments, authToken } = useAuth();

  const appointmentList = [
    { id: 1, title: 'Service 1', date: '2023-06-01', time: '10:00 AM' },
    { id: 2, title: 'Service 2', date: '2023-06-02', time: '11:00 AM' },
    { id: 3, title: 'Service 3', date: '2023-06-03', time: '12:00 PM' },
    // Add more appointments here
  ]


  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/appointment/user/all`, {
          headers: { Authorization: authToken }
        });

        setAppointments(response.data.data);
        console.log(response.data.data);
      
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    }

    fetchAppointments();
  }, []);

  const handleCancel = (id) => {
    console.log('cancel id: ',id);
  };

  const handleReschedule = (id) => {
    // Handle rescheduling logic here
    console.log('reschedule id: ',id);
  };

/*   useEffect(() => {
    const fetchAppointments = async () => {
      const res = await mockApi.getUserAppointments();
      setAppointments(res);
    };
    fetchAppointments();
  }, []);

  const handleCancel = async () => {
    await mockApi.deleteAppointment(cancelId);
    setAppointments(appointments.filter((a) => a.id !== cancelId));
    setShowCancel(false);
  }; */

  return (
    <Container>
      <h2 className='mt-3 text-center'>My Appointments</h2>
      
      <Container className='mt-3'>
      <Nav variant="tabs" defaultActiveKey="/upcoming">
      <Nav.Item>
        <Nav.Link eventKey='/upcoming'>Upcoming Appointments</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="link-1">Previous Appointments</Nav.Link>
      </Nav.Item>
    </Nav>
      </Container>

      {appointments.map((appt) => (
        <AppointmentCard
          key={appt.id}
          id={appt.id}
          title={appt.title}
          date={appt.date}
          time={appt.startTime}
          price={appt.price}
          onCancel={() => handleCancel(appt.id)}
          onReschedule={() => handleReschedule(appt.id)}
        />
      ))}
      

      {/* <Modal show={showCancel} onHide={() => setShowCancel(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancel(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleCancel}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal> */}
    </Container>
  );
};

export default AppointmentManagement;