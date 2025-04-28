import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useAuth } from '../../context/AuthContext';
import StaffReviewModal from './StaffReviewModal';
import axios from "axios";
import PreviousStaffAppointCard from "./PrevoiusStaffAppointCard";

function PreviousStaffAppointments() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { authToken } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const handleReview = (id) => {
    setSelectedAppt(appointments.find(appointment => appointment.id === id));
    setShowReview(true);
  }

  const handleReviewSuccess = (updatedAppointment) => {
    setAppointments(appointments.map(appt => 
      appt.id === updatedAppointment.id ? updatedAppointment : appt
    ));
  }

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/appointment/staff/previous`, {
          headers: { Authorization: authToken }
        });
        if (response.data && response.data.data) {
          setAppointments(response.data.data);
        } else {
          setError("No appointment data received");
        }
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch appointments. Please try again.");
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, [BASE_URL, authToken]);


  return (
    <Container>
          <h2 className="mb-4 text-center">Previous Appointments</h2>
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
                No Previous appointments found.
                </Alert>
            ) : (
                appointments.map((appointment) => (
                 <PreviousStaffAppointCard
                 key={appointment.id}
                 serviceName={appointment.serviceTitle}
                 appointmentDate={appointment.date}
                 appointmentTime={appointment.startTime}
                 price={appointment.price}
                 status={appointment.status}
                 userName={appointment.userName}
                 userImage={appointment.userProfilePicture}
                 review={appointment.review}
                 handleReview={() => handleReview(appointment.id)}
                 />
                ))
            )}
            </Col>
          </Row>
        <StaffReviewModal
         show={showReview}
         setShow={setShowReview}
         selectedAppt={selectedAppt}
         onReviewSuccess={handleReviewSuccess}
       />
      </Container>
  )
}

export default PreviousStaffAppointments