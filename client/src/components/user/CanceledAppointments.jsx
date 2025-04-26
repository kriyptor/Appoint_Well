import React from 'react'
import CanceledAppointCard from './CanceledAppointCard'
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from '../../context/AuthContext';


function CanceledAppointments() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const fetchCanceledAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/appointment/user/canceled`, {
        headers: { Authorization: authToken }
      });
      if (response.data && response.data.data) {
        setAppointments(response.data.data);
      } else {
        setError("No appointment data received");
      }
    } catch (error) {
      setError("Failed to fetch appointments. Please try again.");
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchCanceledAppointments();
  }, [BASE_URL, authToken]);

  return (
    <Container>
    <h2 className="mb-4 text-center">Canceled Appointments</h2>
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
          No Canceled appointments found.
          </Alert>
      ) : (
          appointments.map((appointment) => (
          <CanceledAppointCard
              key={appointment.id}
              serviceName={appointment.serviceTitle}
              appointmentDate={appointment.date}
              appointmentTime={appointment.startTime}
              price={appointment.price}
              status={appointment.status}
              staffName={appointment.staffName}
              staffImage={appointment.staffProfilePicture}
              refundStatus={appointment.refundStatus}
          />
          ))
      )}
      </Col>
    </Row>
  </Container>
  )
}

export default CanceledAppointments