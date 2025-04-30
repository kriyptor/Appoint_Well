import React from 'react'
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from '../../context/AuthContext';
import PaginationComponent from './PaginationComponent';
import PreviousAllAppointmentsCard from './PreviousAllAppointmentsCard';

function PreviousAllAppointments() {
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
   const { authToken } = useAuth();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [appointments, setAppointments] = useState([]);
   const [paginationInfo, setPaginationInfo] = useState({
     currentPage: 1,
     itemsPerPage: 5,
     totalItems: 0,
     totalPages: 1,
     hasNextPage: false,
     hasPrevPage: false,
   });
 
   const fetchCanceledAppointments = async (page=1) => {
     setLoading(true);
     setError(null);
     try {
       const response = await axios.get(`${BASE_URL}/appointment/admin/previous`, {
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
   }

    const handlePageChange = (page) => {
      fetchCanceledAppointments(page);
    };

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
           <PreviousAllAppointmentsCard
               key={appointment.id}
               id={appointment.id}
               serviceName={appointment.serviceTitle}
               appointmentDate={appointment.date}
               appointmentTime={appointment.startTime}
               price={appointment.price}
               status={appointment.status}
               staffName={appointment.staffName}
               staffImage={appointment.staffProfilePicture}
               userName={appointment.userName}
               userImage={appointment.userProfilePicture}
               review={appointment.review}
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
   )
}

export default PreviousAllAppointments