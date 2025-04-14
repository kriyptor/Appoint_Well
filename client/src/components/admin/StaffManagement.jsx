import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Form } from 'react-bootstrap';
import mockApi from '../../mockData';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      const res = await mockApi.getStaff();
      setStaff(res);
    };
    fetchStaff();
  }, []);

  const handleAddStaff = async () => {
    const res = await mockApi.addStaff({ name, email });
    setStaff([...staff, res]);
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div>
      <h2>Staff Management</h2>
      <Form>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Form.Control
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="mt-2" onClick={handleAddStaff}>
            Add Staff
          </Button>
        </Form.Group>
      </Form>
      <ListGroup className="mt-3">
        {staff.map((s) => (
          <ListGroup.Item key={s.id}>
            {s.name} - {s.email}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default StaffManagement;