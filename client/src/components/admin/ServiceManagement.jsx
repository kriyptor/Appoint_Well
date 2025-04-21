import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Container, Row, Col, Alert, Card, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ServiceCard from './ServiceCard';

const ServiceManagement = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [description, setDescription] = useState('');
  const [serviceImage, setServiceImage] = useState('');
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { authToken } = useAuth();


  useEffect(() => {
    const fetchServices = async () => {
      try {

        const response = await axios.get(`${BASE_URL}/service/get-all-services`, {
          headers: {
            'Authorization': authToken
          }
        });

        setServices(response.data.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, [BASE_URL, authToken]);

  const handleAddService = async () => {
    try {
      setError('');
      setSuccess('');

      if (!title || !category || !price || (!hours && !minutes) || !description) {
        setError('Please fill all fields.');
        return; 
      }

      // Format duration as HH:MM:SS
      const pad = (n) => n.toString().padStart(2, '0');
      const formatedDuration = `${pad(hours)}:${pad(minutes)}:00`;

      const newService = {
        title,
        category,
        price,
        duration: formatedDuration,
        description,
      };

      if (serviceImage) {
        newService.serviceImage = serviceImage;
      }

      setIsLoading(true);
      
      const response = await axios.post(`${BASE_URL}/service/create`, newService, {
        headers: {
          'Authorization': authToken
        }
      });
      console.log(response);
      setTitle('');
      setCategory('');
      setPrice('');
      setHours('0');
      setMinutes('0');
      setDescription('');
      setServiceImage('');
      setSuccess('Service added successfully!');
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };


  const handleDeleteService = async (serviceId) => {
    try {
      await axios.delete(`${BASE_URL}/service/delete/${serviceId}`, {
        headers: {
          'Authorization': authToken
        }
      });
      setServices(services.filter((service) => service.id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };


  const setEditServiceData = (service) => {
    setIsEditing(true);
    setTitle(service.title);
    setCategory(service.category);
    setPrice(service.price);
    setHours(service.hours);
    setMinutes(service.minutes);
    setDescription(service.description);
    setServiceImage(service.serviceImage);
    window.scrollTo(0, 0);
  };

  return (
    <Container className="py-2">
      <Row className="justify-content-center">
        <Col md={8} lg={8}>
          <Card className="shadow-sm mb-4">
               <Card.Header className="bg-primary text-white text-center">
                    <h4 className="mb-0">Service Management</h4>
                </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
              {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Service Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Service Name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Select Category</option>
                    <option value="Hair">Hair</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Nail">Nail</option>
                    <option value="Skincare">Skincare</option>
                  </Form.Select>
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Price (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Label>Duration</Form.Label>
                    <Row>
                      <Col>
                        <Form.Select
                          value={hours}
                          onChange={(e) => setHours(e.target.value)}
                        >
                          {[...Array(13).keys()].map((h) => (
                            <option key={h} value={h}>{h} hr</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col>
                        <Form.Select
                          value={minutes}
                          onChange={(e) => setMinutes(e.target.value)}
                        >
                          {[0, 15, 30, 45].map((m) => (
                            <option key={m} value={m}>{m} min</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Image URL (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Image URL"
                    value={serviceImage}
                    onChange={(e) => setServiceImage(e.target.value)}
                  />
                </Form.Group>
                <div className="d-grid">
                   {
                     isEditing ? (
                      <Button variant="warning">
                        Update Service
                      </Button>
                     ) : (
                      <Button variant="primary" onClick={handleAddService}>
                      {isLoading ? (<><Spinner size="sm" className="me-2" />Adding Service...</>) : 'Add Service'}
                      </Button>
                     )
                   }
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="mt-4">
        <h4 className="mb-3 text-center">All Services</h4>
        {services &&
          services.map((service) => (
            <ServiceCard
            key={service.id} 
            service={service} 
            onDelete={() => handleDeleteService(service.id)}
            onEdit={() => setEditServiceData(service)}
            />
          ))}
      </div>
    </Container>
  );
};

export default ServiceManagement;