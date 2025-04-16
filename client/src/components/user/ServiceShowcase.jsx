import React,{ useState,useEffect } from 'react';
import axios from 'axios';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const ServiceShowcase = () => {
  // Mock service data
  const mockServices = [
    {
      id: 2,
      name: "Facial Treatment",
      category: "Skin Care",
      price: 75,
      duration: 90,
      description:
        "Relaxing facial treatment with deep cleansing and moisturizing.",
      image:
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600",
    },
    {
      id: 3,
      name: "Manicure & Pedicure",
      category: "Nail Care",
      price: 55,
      duration: 75,
      description:
        "Complete nail care package for hands and feet with massage.",
      image:
        "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600",
    },
    {
      id: 4,
      name: "Full Body Massage",
      category: "Massage",
      price: 90,
      duration: 120,
      description:
        "Therapeutic full body massage to relieve stress and tension.",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600",
    },
  ];

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authToken } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/service/get-all-services`,{
          headers: { Authorization: authToken }
        });

        setServices(response.data.data);
        setIsLoading(false);

      } catch (error) {
        console.error('Error fetching services:', error);
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
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
                  <Button variant="primary" className="w-100">Book Appointment</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ServiceShowcase;