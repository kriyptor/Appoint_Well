import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import mockApi from '../../mockData';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      const res = await mockApi.getServices();
      setServices(res);
    };
    fetchServices();
  }, []);

  const handleAddService = async () => {
    const res = await mockApi.addService({
      name,
      category,
      price: parseFloat(price),
      duration: parseInt(duration),
      description,
    });
    setServices([...services, res]);
    setName('');
    setCategory('');
    setPrice('');
    setDuration('');
    setDescription('');
  };

  return (
    <div>
      <h2>Service Management</h2>
      <Form>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Service Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            <option value="Hair">Hair</option>
            <option value="Makeup">Makeup</option>
            <option value="Nail">Nail</option>
            <option value="Skincare">Skincare</option>
          </Form.Select>
          <Form.Control
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Form.Control
            type="number"
            placeholder="Duration (mins)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <Form.Control
            as="textarea"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button className="mt-2" onClick={handleAddService}>
            Add Service
          </Button>
        </Form.Group>
      </Form>
      <ListGroup className="mt-3">
        {services.map((s) => (
          <ListGroup.Item key={s.id}>
            {s.name} - {s.category} - ${s.price}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default ServiceManagement;