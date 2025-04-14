import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Modal } from 'react-bootstrap';
import mockApi from '../../mockData';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelId, setCancelId] = useState(null);

  useEffect(() => {
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
  };

  return (
    <div>
      <h2>My Appointments</h2>
      <ListGroup>
        {appointments.map((a) => (
          <ListGroup.Item key={a.id}>
            {a.serviceName} on {a.date} at {a.time} - Status: {a.status}
            <Button
              variant="danger"
              className="ms-2"
              onClick={() => {
                setCancelId(a.id);
                setShowCancel(true);
              }}
            >
              Cancel
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Modal show={showCancel} onHide={() => setShowCancel(false)}>
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
      </Modal>
    </div>
  );
};

export default AppointmentManagement;