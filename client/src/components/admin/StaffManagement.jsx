import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const StaffManagement = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [staff, setStaff] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { authToken } = useAuth();
 

/*   useEffect(() => {
    const fetchStaff = async () => {
      const res = await mockApi.getStaff();
      setStaff(res);
    };
    fetchStaff();
  }, []); */

  const handleAddStaff = async () => {
   try {
    const response = await axios.post(`${BASE_URL}/auth/staff/sign-up`, {
      name,
      email,
      password,
    }, {
      headers: {
        'Authorization': authToken,
      }
    });
    if (response.status === 201) {
     // console.log('Staff added successfully');
      alert('Staff added successfully');
    }

    setName('');
    setEmail('');
    setPassword('');
   } catch (error) {
    console.error('Error adding staff:', error);
   }
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
    </div>
  );
};

export default StaffManagement;