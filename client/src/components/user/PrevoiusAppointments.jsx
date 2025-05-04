import PrevoiusAppointCard from './PrevoiusAppointCard';
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from '../../context/AuthContext';
import ReviewModal from './ReviewModal';
import PaginationUserComponent from './PaginationUserComponent';


function PrevoiusAppointments() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [paginationInfo, setPaginationInfo] = useState({
       currentPage: 1,
       itemsPerPage: 5,
       totalItems: 0,
       totalPages: 1,
       hasNextPage: false,
       hasPrevPage: false,
     });

  const handleReview = (id) => {
    setSelectedAppt(appointments.find(appointment => appointment.id === id));
    setShowReview(true);
  }

  const handleReviewSuccess = (updatedAppointment) => {
    setAppointments(appointments.map(appt => 
      appt.id === updatedAppointment.id ? updatedAppointment : appt
    ));
  }

  const fetchAppointments = async (page=1) => {
    try {
      const response = await axios.get(`${BASE_URL}/appointment/user/previous`, {
        headers: { Authorization: authToken },
        params: { page }
      });
      if (response.data && response.data.data) {
        setAppointments(response.data.data);
        setPaginationInfo(response.data.pagination);
      } else {
        setError("No appointment data received");
      }
    } catch (error) {
      setError("Failed to fetch appointments. Please try again.");
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (page) => {
    fetchAppointments(page);
  };

  useEffect(() => {
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
                key={appointment.id}
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
      <Row className="justify-content-center mt-3">
        <Col xs="auto">
          <PaginationUserComponent
            paginationInfo={paginationInfo}
            loading={loading}
            handlePageChange={handlePageChange}
          />
        </Col>
      </Row>
      <ReviewModal
        show={showReview}
        setShow={setShowReview}
        selectedAppt={selectedAppt}
        onReviewSuccess={handleReviewSuccess}
      />
    </Container>
  );
}

export default PrevoiusAppointments