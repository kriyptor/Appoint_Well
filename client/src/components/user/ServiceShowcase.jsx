import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import AppointmentBookingModal from './AppointmentBookingModal';

const ServiceShowcase = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [show, setShow] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authToken } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/service/get-all-services`, {
          headers: { Authorization: authToken }
        });
        setServices(response.data.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, [BASE_URL, authToken]);

  const handleBookAppointment = (service) => {
    setSelectedService(service);
    setShow(true);
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <>
      <Container className="py-5">
        <h2 className="text-center mb-4">Our Services</h2>
        <Row className="g-4 justify-content-center">
          {services.map((service) => (
            <Col key={service.id} xs={12} sm={6} lg={4}>
              <Card className="h-100 shadow-sm hover-effect">
                <Card.Img 
                  variant="top" 
                  src={service.serviceImage} 
                  style={{ height: '200px', objectFit: 'cover' }} 
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fw-bold">{service.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{service.category}</Card.Subtitle>
                  <Card.Text>{service.description}</Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-bold">₹{service.price}</span>
                      <span className="text-muted">{service.duration} hr</span>
                    </div>
                    <Button 
                      variant="primary" 
                      className="w-100" 
                      onClick={() => handleBookAppointment(service)}
                    >
                      Book Appointment
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      {selectedService && (
        <AppointmentBookingModal 
          selectedService={selectedService} 
          show={show} 
          setShow={setShow}
        />
      )}
    </>
  );
};

export default ServiceShowcase;