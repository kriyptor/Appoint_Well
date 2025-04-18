import React, { useState } from 'react';
import { Form, Button, Spinner, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { authToken } = useAuth();

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

  return (
    <Container className="py-2">
      <Row className="justify-content-center">
        <Col md={8} lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h3 className="mb-2 text-center">Service Management</h3>
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
                <Form.Group className="mb-3 mt-3">
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
                     <Button variant="primary" onClick={handleAddService}>
                      {isLoading ? (<><Spinner size="sm" className="me-2" />Adding Service...</>) : 'Add Service'}
                     </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

 {/*      <Row className="justify-content-center">
        <Col md={10}>
          <h4 className="mb-3">All Services</h4>
          <ListGroup>
            {services.length === 0 && (
              <ListGroup.Item className="text-center text-muted">No services added yet.</ListGroup.Item>
            )}
            {services.map((service) => (
              <ListGroup.Item key={service.id} className="d-flex align-items-center">
                {service.serviceImage && (
                  <img
                    src={service.serviceImage}
                    alt={service.title}
                    style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 16, borderRadius: 4 }}
                  />
                )}
                <div>
                  <div className="fw-bold">{service.title} <span className="text-muted">({service.category})</span></div>
                  <div>₹{service.price} | Duration: <span className="badge bg-secondary">{service.duration}</span></div>
                  <div className="small text-muted">{service.description}</div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row> */}
    </Container>
  );
};

export default ServiceManagement;