import React from "react";
import UpcomingStaffAppointCard from "./UpcomingStaffAppointCard";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useAuth } from '../../context/AuthContext';
import axios from "axios";


function UpcomingStaffAppointments() {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const { authToken } = useAuth();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);


useEffect(() => {  
  const fetchUpcomingAppointments = async () => {
    setLoading(true);
    try {
        const response = await axios.get(`${BASE_URL}/appointment/staff/upcoming`, {
            headers: { Authorization: authToken }
        });
        if (response.data && response.data.data) {
            setAppointments(response.data.data);
            console.log('Fetched upcoming appointments:', response.data.data);
        } else {
            setError("No appointment data received");
        }
        setLoading(false);
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
    }
  };

  fetchUpcomingAppointments();
}, [BASE_URL, authToken]);

  return (
<>
<Container>
      <h2 className="mb-4 text-center">Upcoming Appointments</h2>
      <Row className="justify-content-center">
      <Col md={6}>
        {loading ? (
            <div className="text-center">
            <Spinner animation="border" role="status" />
            </div>
        ) : error ? (
            <Alert variant="danger" className="text-center">
            {error}
            </Alert>
        ) : appointments.length === 0 ? (
            <Alert variant="info" className="text-center">
            No upcoming appointments found.
            </Alert>
        ) : (
            appointments.map((appointment) => (
            <UpcomingStaffAppointCard
                key={appointment.id}
                id={appointment.id}
                serviceName={appointment.serviceTitle}
                appointmentDate={appointment.date}
                appointmentTime={appointment.startTime}
                price={appointment.price}
                status={appointment.status}
                userName={appointment.userName}
                userImage={appointment.userProfilePicture}
            />
            ))
        )}
        </Col>
      </Row>
    </Container>
</>
  );
}

export default UpcomingStaffAppointments;
