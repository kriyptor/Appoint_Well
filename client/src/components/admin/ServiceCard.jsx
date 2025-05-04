import React from "react";
import { Card, Button, Row, Col, Table } from "react-bootstrap";

function ServiceCard({ service, onEdit }) {
  return (
    <Card className="mb-3 shadow-sm">
      <Row className="g-0 align-items-center">
        <Col
          md={5}
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: 180 }}
        >
          <img
            src={service.serviceImage}
            alt="Service"
            className="rounded"
            style={{
              width: "85%",
              height: "100%",
              objectFit: "cover",
              border: "2px solid #eee",
              background: "#fafafa",
            }}
          />
        </Col>
        <Col md={7}>
          <Card.Body className="p-4 text-center">
            <h5 className="mb-2">{service.title}</h5>
            <hr />
            <Table striped bordered hover responsive>
              <tbody>
                <tr>
                  <td>Category</td>
                  <td>{service.category}</td>
                </tr>
                <tr>
                  <td>Price</td>
                  <td>₹{service.price}</td>
                </tr>
                <tr>
                  <td>Duration</td>
                  <td>{service.duration}</td>
                </tr>
              </tbody>
            </Table>
            <div className="d-flex justify-content-end">
              <Button variant="outline-warning" className="me-2" onClick={onEdit}>
                Edit
              </Button>
              {/* <Button variant="outline-danger" onClick={onDelete}>Delete</Button> */}
            </div>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}

export default ServiceCard;
