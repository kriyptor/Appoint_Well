import React, { useState } from 'react';
import AdminProfileCard from './AdminProfileCard';
import AdminProfileModal from './AdminProfileModal';

const initialAdmin = {
  name: "Admin User",
  email: "admin@example.com",
  role: "admin"
};

function AdminProfile() {
  const [adminData, setAdminData] = useState(initialAdmin);
  const [showModal, setShowModal] = useState(false);

  const handleEdit = () => setShowModal(true);

  const handleUpdate = (updatedData) => {
    setAdminData(updatedData);
    setShowModal(false);
  };

  return (
    <>
      <AdminProfileCard
        admin={adminData}
        onEdit={handleEdit}
      />
      <AdminProfileModal
        show={showModal}
        onHide={() => setShowModal(false)}
        admin={adminData}
        onUpdate={handleUpdate}
      />
    </>
  );
}

export default AdminProfile;