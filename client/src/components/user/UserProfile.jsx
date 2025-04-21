import React, { useState, useEffect } from 'react';
import UserProfileCard from './UserProfileCard';
import UserProfileModal from './UserProfileModal';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const initialAdmin = {
  name: "Shivak",
  email: "user@example.com",
  role: "user"
};

function UserProfile() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [userData, setUserData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const { authToken } = useAuth();

  const handleEdit = () => setShowModal(true);

/*   const handleUpdate = async (updatedData) => {
    try {
        
        const { name, email, profilePicture } = updatedData;

        const response = await axios.post(`${BASE_URL}/auth/user/update`, {
          name,
          email,
          password,
          profilePicture
        }, {
          headers: {
            Authorization: authToken,
          },
        })
        setUserData(updatedData);
        console.log(name, email, profilePicture, password);
        setShowModal(false);
    } catch (error) {
        console.error('Error updating user data:', error);
    }
  }; */

  useEffect(() => {
   const fetchUserData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/user/data`, {
        headers: {
          Authorization: authToken,
        },
      });
      console.log(response.data.data);
      setUserData(response.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
   };

   fetchUserData();
  }, []);

  return (
    <>
      <UserProfileCard
        user={userData}
        onEdit={handleEdit}
      />
      <UserProfileModal
        show={showModal}
        setShowModal={setShowModal}
        setUserData={setUserData}
        user={userData}
      />
    </>
  );
}

export default UserProfile;