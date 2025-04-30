import React from "react";
import axios from "axios";
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from "react";
import PaginationComponent from "./PaginationComponent";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import UpcomingAllAppointmentCard from "./UpcomingAllAppointmentCard";


function UpcomingAllAppointment() {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const { authToken } = useAuth();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({
        currentPage: 1,
        itemsPerPage: 5,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      });

    const fetchUpcomingAppointments = async ( page = 1 ) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/appointment/admin/upcoming`, {
                headers: { Authorization: authToken },
                params: { page }
            });
            if (response.data && response.data.data) {
                setAppointments(response.data.data);
                setPaginationInfo(response.data.pagination);
                console.log('Fetched upcoming appointments:', response.data.data);
            } else {
                setError("No appointment data received");
            }
            setLoading(false);
        } catch (error) {
          console.error('Error fetching upcoming appointments:', error);
        }
      };

    useEffect(() => {  
    fetchUpcomingAppointments();
    }, [BASE_URL, authToken]);

    const handlePageChange = (page) => {
        fetchUpcomingAppointments(page);
      };

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
            <UpcomingAllAppointmentCard
                key={appointment.id}
                id={appointment.id}
                serviceName={appointment.serviceTitle}
                appointmentDate={appointment.date}
                appointmentTime={appointment.startTime}
                price={appointment.price}
                status={appointment.status}
                userName={appointment.userName}
                userImage={appointment.userProfilePicture}
                staffName={appointment.staffName}
                staffImage={appointment.staffProfilePicture}
            />
            ))
        )}
        </Col>
        </Row>
        <Row className="justify-content-center mt-3">
        <Col xs="auto">
          <PaginationComponent
            paginationInfo={paginationInfo}
            loading={loading}
            handlePageChange={handlePageChange}
          />
        </Col>
      </Row>
    </Container>
</>
  );
}

export default UpcomingAllAppointment