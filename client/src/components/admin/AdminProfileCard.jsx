import React from 'react';
import { Container, Card, Badge, Row, Col, Button } from 'react-bootstrap';

function AdminProfileCard({ admin, onEdit }) {
  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={7} lg={6}>
          <Card className="shadow-sm">
            <Card.Header as="h4" className="text-center bg-primary text-white">
              Profile
            </Card.Header>
            <Card.Body className="d-flex flex-column align-items-center">
              <img
                src="https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                alt="Profile"
                style={{ width: 140, height: 140, objectFit: "cover" }}
                className="img-fluid rounded-circle mb-3"
              />
              <div className="w-100">
                <div className="mb-3 text-center">
                  <h5 className="mb-1">{admin.name}</h5>
                  <div className="text-muted mb-1">
                    <i className="bi bi-envelope me-2"></i>
                    {admin.email}
                  </div>
                  <div>
                    <span className="fw-semibold">Role: </span>
                    <Badge
                      bg={
                        admin.role === "admin"
                          ? "danger"
                          : admin.role === "staff"
                          ? "warning"
                          : "primary"
                      }
                      className="text-capitalize"
                    >
                      {admin.role}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="w-100 d-flex justify-content-center mt-3">
                <Button variant="outline-primary" size="md" onClick={onEdit}>
                  <i className="bi bi-pencil me-2"></i>
                  Edit Profile
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminProfileCard;