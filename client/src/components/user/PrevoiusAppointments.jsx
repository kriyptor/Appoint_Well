import PrevoiusAppointCard from './PrevoiusAppointCard';
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from '../../context/AuthContext';
import ReviewModal from './ReviewModal';


function PrevoiusAppointments() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const handleReview = (id) => {
    setSelectedAppt(appointments.find(appointment => appointment.id === id));
    setShowReview(true);
  }

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/appointment/user/previous`, {
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
                  <PrevoiusAppointCard
                  serviceName={appointment.serviceTitle}
                  appointmentDate={appointment.date}
                  appointmentTime={appointment.startTime}
                  price={appointment.price}
                  status={appointment.status}
                  staffName={appointment.staffName}
                  staffImage={appointment.staffProfilePicture}
                  review={appointment.review}
                  handleReview={() => handleReview(appointment.id)}
                />
                ))
            )}
            </Col>
          </Row>
        <ReviewModal
         show={showReview}
         setShow={setShowReview}
         selectedAppt={selectedAppt}
         /* onReviewSuccess={handleReviewSuccess} */
       />
      </Container>
  )
}

export default PrevoiusAppointments