import React, { useState, useEffect } from 'react';
import AdminProfileCard from './AdminProfileCard';
import AdminProfileModal from './AdminProfileModal';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';


function AdminProfile() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminData, setAdminData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const { authToken } = useAuth();

  const handleEdit = () => setShowModal(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/auth/admin/data`, 
        { 
          headers: { Authorization: authToken } 
        });
        setAdminData(response.data.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);


  return (
    <>
      <AdminProfileCard
        admin={adminData}
        onEdit={handleEdit}
      />
      <AdminProfileModal
        show={showModal}
        setShowModal={setShowModal}
        admin={adminData}
        setAdminData={setAdminData}
      />
    </>
  );
}

export default AdminProfile;