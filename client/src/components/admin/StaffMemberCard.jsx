import React, { useState } from "react";
import { Button, Card, Col, InputGroup, Row, Spinner } from "react-bootstrap";
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';


function StaffMemberCard({ staff, onRemove }) {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { authToken } = useAuth();

  const handleTogglePassword = async () => {
    if (showPassword) {
      // If password is shown, just hide it
      setShowPassword(false);
      setPassword("");
    } else {
      // If password is hidden, fetch and show it
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/staff/staff-password`, {
          params: { id: staff.id },
          headers: { Authorization: authToken }
        });

        setPassword(response.data.data.password);
        setShowPassword(true);
      } catch (error) {
        console.error("Error fetching password:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body className="p-4">
        <Row className="align-items-center">
          <Col md={3} className="text-center">
            <img
              src={staff.profilePicture}
              alt="Staff Avatar"
              className="img-fluid rounded-circle mb-3 mb-md-0"
              style={{ width: "120px", height: "120px", objectFit: "cover" }}
            />
          </Col>
          <Col md={6}>
            <h5 className="mb-2">{staff.name}</h5>
            <p className="text-muted mb-1">Role: Staff</p>
            <p className="text-muted mb-1">Email: {staff.email}</p>
            <p className="text-muted mb-0">
              Specializations: {staff.specializations.join(", ") || "None"}
            </p>
            {showPassword && password && (
              <InputGroup.Text className="mt-1">
                {password}
              </InputGroup.Text>
            )}
          </Col>
          <Col md={3} className="text-md-end">
            {/* <Button
              variant="outline-danger"
              onClick={onRemove}
              className="me-2"
            >
              Remove
            </Button> */}
            <Button 
              variant={showPassword ? "outline-warning" : "info"}
              onClick={handleTogglePassword}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Getting Password...
                </>
              ) : (
                showPassword ? "Hide Password" : "Show Password"
              )}
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default StaffMemberCard;
