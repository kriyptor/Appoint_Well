import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Modal, Nav, Container } from 'react-bootstrap';
import AppointmentCard from './AppointmentCard';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelId, setCancelId] = useState(null);

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

      <AppointmentCard/>
      <AppointmentCard/>
      <AppointmentCard/>

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