import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ServiceCard from './ServiceCard';

const ServiceManagement = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { authToken } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [description, setDescription] = useState('');
  const [serviceImage, setServiceImage] = useState('');
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/service/get-all-services`, {
        headers: { Authorization: authToken }
      });
      setServices(response.data.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Error fetching services. Please try again.');
    }
  };

  useEffect(() => {
    fetchServices();
  }, [BASE_URL, authToken]);

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setPrice('');
    setHours(0);
    setMinutes(0);
    setDescription('');
    setServiceImage('');
    setCurrentServiceId(null);
    setIsEditing(false);
  };

  const handleAddService = async () => {
    try {
      setError('');
      setSuccess('');
      if (!title || !category || !price || (!hours && !minutes) || !description) {
        setError('Please fill all required fields.');
        return;
      }
      
      // Format duration as HH:MM:SS using a safe pad function
      const pad = (n) => {
        return (n !== undefined && n !== null) ? n.toString().padStart(2, '0') : '00';
      };
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
      await axios.post(`${BASE_URL}/service/create`, newService, {
        headers: { Authorization: authToken }
      });
      
      resetForm();
      setSuccess('Service added successfully!');
      await fetchServices(); // Refresh the services list
    } catch (error) {
      console.error('Error adding service:', error);
      setError('Error adding service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const setEditServiceData = (service) => {
    setIsEditing(true);
    setCurrentServiceId(service.id);
    setTitle(service.title || '');
    setCategory(service.category || ''); 
    setPrice(service.price || '');
    
    // Parse duration if it exists
    if (service.duration) {
      const [h, m] = service.duration.split(':');
      setHours(parseInt(h, 10) || 0);
      setMinutes(parseInt(m, 10) || 0);
    } else {
      setHours(0);
      setMinutes(0);
    }
    
    setDescription(service.description || '');
    setServiceImage(service.serviceImage || '');
    window.scrollTo(0, 0);
  };

  const handleUpdateService = async () => {
    try {
      setError('');
      setSuccess('');

      if (!title.trim() || !category.trim() || !price || !description.trim()) {
        setError('Please fill all required fields.');
        return;
      }

      if (!currentServiceId) {
        setError('Service ID is missing. Cannot update.');
        return;
      }

      const hrs = hours !== '' && !isNaN(hours) ? Number(hours) : 0;
      const mins = minutes !== '' && !isNaN(minutes) ? Number(minutes) : 0;

      // Use a safe pad function
      const pad = (n) => {
        return (n !== undefined && n !== null) ? n.toString().padStart(2, '0') : '00';
      };

      const formatedDuration = `${pad(hrs)}:${pad(mins)}:00`;

      const updatedService = {
        serviceId: currentServiceId,
        title,
        category,
        price,
        duration: formatedDuration,
        description,
      };

      if (serviceImage) {
        updatedService.serviceImage = serviceImage;
      }

      setIsLoading(true);
      await axios.post(`${BASE_URL}/service/update`, updatedService, {
        headers: { Authorization: authToken }
      });

      resetForm();
      setSuccess('Service updated successfully!');
      await fetchServices(); // Refresh the services list
    } catch (error) {
      console.error('Error updating service:', error);
      setError('Error updating service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  return (
    <Container className="py-2">
      <Row className="justify-content-center">
        <Col md={8} lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white text-center">
              <h4 className="mb-0">{isEditing ? 'Edit Service' : 'Add New Service'}</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
              {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Service Name*</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Service Name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Category*</Form.Label>
                  <Form.Select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
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
                      <Form.Label>Price (₹)*</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Label>Duration*</Form.Label>
                    <Row>
                      <Col>
                        <Form.Select
                          value={hours}
                          onChange={(e) => setHours(parseInt(e.target.value, 10))}
                        >
                          {[...Array(13).keys()].map((h) => (
                            <option key={h} value={h}>{h} hr</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col>
                        <Form.Select
                          value={minutes}
                          onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
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
                  <Form.Label>Description*</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
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
                <div className="d-grid gap-2">
                  {isEditing ? (
                    <>
                      <Button 
                        variant="warning" 
                        onClick={handleUpdateService}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Updating Service...
                          </>
                        ) : 'Update Service'}
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="primary" 
                      onClick={handleAddService}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Adding Service...
                        </>
                      ) : 'Add Service'}
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="mt-4">
        <h4 className="mb-3 text-center">All Services</h4>
        {services && services.length > 0 ? (
          services.map((service) => (
            <ServiceCard
              key={service.id} 
              service={service} 
              onEdit={() => setEditServiceData(service)}
            />
          ))
        ) : (
          <p className="text-center">No services found.</p>
        )}
      </div>
    </Container>
  );
};

export default ServiceManagement;