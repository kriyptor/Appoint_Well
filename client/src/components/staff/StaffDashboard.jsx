import React, { useState, useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';
import mockApi from '../../mockData';

const StaffDashboard = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const res = await mockApi.getStaffAppointments();
      setAppointments(res);
    };
    fetchAppointments();
  }, []);

  return (
    <div>
      <h2>My Appointments</h2>
      <ListGroup>
        {appointments.map((a) => (
          <ListGroup.Item key={a.id}>
            {a.serviceName} for {a.clientName} on {a.date} at {a.time}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default StaffDashboard;