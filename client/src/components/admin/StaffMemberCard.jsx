import React from "react";
import { Button, Card, Col, Row } from "react-bootstrap";

function StaffMemberCard({ staff, onRemove }) {
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
            <p className="text-muted mb-1">
              Email: {staff.email}
            </p>
            <p className="text-muted mb-0">
              Specializations:{" "}
              {staff.specializations.join(', ') || 'None'}
            </p>
          </Col>
          <Col md={3} className="text-md-end">
            <Button variant="outline-danger" onClick={onRemove}>Remove</Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default StaffMemberCard;
