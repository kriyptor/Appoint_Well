import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import StaffMemberCard from './StaffMemberCard';

const StaffManagement = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { authToken } = useAuth();
  
  // Form states
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  
  // Data and UI states
  const [fetchedServicesData, setFetchedServicesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get unique categories from services
  const categories = [...new Set(fetchedServicesData.map(s => s.category))];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const ServiceResponse = await axios.get(`${BASE_URL}/service/get-all-services-data`, {
          headers: { Authorization: authToken }
        });
        if (ServiceResponse.data.data) {
          setFetchedServicesData(ServiceResponse.data.data);
        }

        const StaffResponse = await axios.get(`${BASE_URL}/staff/all-staff`, {
          headers: { Authorization: authToken }
        });
        if (StaffResponse.data.data) {
          setStaffMembers(StaffResponse.data.data);
        }
      } catch (err) {
        setError('Failed to load services');
        console.error('Error fetching services:', err);
      }
    };
    fetchServices();
  }, [BASE_URL, authToken]);

  const handleServiceChange = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSpecializationChange = (category) => {
    setSpecializations(prev => 
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const handleAddStaff = async (e) => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (!name) {
      setError('Please enter staff name');
      setLoading(false);
      return;
    }

    const staffData =  {
      name,
      specializations,
      serviceIds: selectedServices
    }

    if(imageUrl) {  
      staffData.profilePicture = imageUrl;
    }

    try {
      const response = await axios.post(`${BASE_URL}/staff/create`, staffData,
        { headers: { Authorization: authToken } }
      );

      if (response.status === 201) {
        setSuccess('Staff member added successfully!');
        // Reset form
        setName('');
        setSelectedServices([]);
        setSpecializations([]);
        setImageUrl('');
        setStaffMembers(prev => [...prev, response.data.data]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStaff = async (staffId) => {
    try {
      await axios.delete(`${BASE_URL}/staff/${staffId}`, {
        headers: { Authorization: authToken }
      });
      setStaffMembers(prev => prev.filter(staff => staff.id !== staffId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error removing staff member');
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white text-center">
          <h4 className="mb-0">Staff Management</h4>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          <Form>
            <Form.Group className="mb-4">
              <Form.Label>Staff Name*</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter staff name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Assign Services</Form.Label>
              <div className="border rounded p-3">
                <Row xs={1} md={2} lg={8} className="g-3">
                  {fetchedServicesData.map((service) => (
                    <Col key={service.id}>
                      <Form.Check
                        type="checkbox"
                        id={`service-${service.id}`}
                        label={service.title}
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceChange(service.id)}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Specializations</Form.Label>
              <div className="border rounded p-3">
                <Row xs={1} md={2} lg={3} className="g-3">
                  {categories.map((category) => (
                    <Col key={category}>
                      <Form.Check
                        type="checkbox"
                        id={`category-${category}`}
                        label={category}
                        checked={specializations.includes(category)}
                        onChange={() => handleSpecializationChange(category)}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Profile Picture (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </Form.Group>

            <div className="d-grid">
              <Button
                variant="primary"
                disabled={loading}
                onClick={handleAddStaff}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Adding Staff...
                  </>
                ) : (
                  "Add Staff Member"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <div className="mt-4">
        <h4 className="mb-3 text-center">Staff Members</h4>
        {staffMembers &&
          staffMembers.map((staff) => (
            <StaffMemberCard 
            key={staff.id} 
            staff={staff} 
            onRemove={() => handleRemoveStaff(staff.id)}
            />
          ))}
      </div>
    </Container>
  );
};

export default StaffManagement;