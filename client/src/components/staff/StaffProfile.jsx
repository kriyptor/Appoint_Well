import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StaffProfileCard from './StaffProfileCard';
import StaffProfileModal from './StaffProfileModal';
import axios from 'axios';


function StaffProfile() {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [staffData, setStaffData] = useState({});
    const [showModal, setShowModal] = useState(false);
    const { authToken } = useAuth();
  
    const handleEdit = () => setShowModal(true);
  
    useEffect(() => {
     const fetchUserData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/auth/staff/data`, {
          headers: {
            Authorization: authToken,
          },
        });
        setStaffData(response.data.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
     };
  
     fetchUserData();
    }, []);
  
    return (
      <>
        <StaffProfileCard
          staff={staffData}
          onEdit={handleEdit}
        />
        <StaffProfileModal
          show={showModal}
          setShowModal={setShowModal}
          setStaffData={setStaffData}
          staff={staffData}
        />
      </>
    );
}

export default StaffProfile