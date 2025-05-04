import React from "react";
import { Card, Badge, Row, Col } from "react-bootstrap";
import { format } from "date-fns";

function CanceledAppointCard({
  serviceName,
  appointmentDate,
  appointmentTime,
  price,
  refundStatus,
  staffName,
  staffImage,
}) {
 const formattedDate = format(new Date(appointmentDate), "MMM dd, yyyy");
   return (
     <Row className="align-items-center">
     <Col md={12} className="mb-3">
     <Card className="mb-4 shadow-md border-1">
         {/* Card Header */}
       <Card.Header as="h5" className="text-center bg-danger text-white">
         Canceled Appointment
       </Card.Header>
       <Card.Body className="p-4">
 
           {/* Section 1: Appointment Details */}
             <div className="d-flex justify-content-between align-items-center mb-2">
               <h5 className="mb-0 fw-semibold text-dark">{serviceName}</h5>
               <Badge
                 bg={refundStatus === true ? "success" : "danger"}
                 className="px-3 py-2 text-capitalize"
                 style={{ fontSize: "0.95rem", letterSpacing: 0.5 }}
               >
                 {refundStatus === true ? "Refunded!" : "Not Refunded!"}
               </Badge>
             </div>
             <div className="text-muted mb-2" style={{ fontSize: "1rem" }}>
               {formattedDate}
               <span className="mx-2">|</span>
               {appointmentTime}
             </div>
             <div>
               <span className="text-secondary" style={{ fontSize: "1rem" }}>Paid:</span>
               <span className="fw-bold ms-2" style={{ fontSize: "1.15rem", color: "#198754" }}>
                 ₹{price}
               </span>
             </div>
             <div
               className="d-flex align-items-center p-3 mt-2"
               style={{
                 background: "#f8f9fa",
                 borderRadius: 12,
                 boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
               }}
             >
               <img
                 src={staffImage}
                 alt={staffName}
                 className="rounded-circle me-3"
                 style={{
                   width: 75,
                   height: 75,
                   objectFit: "cover",
                   border: "2px solid #e9ecef",
                   background: "#fff",
                 }}
               />
               <div>
                 <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                   Your Stylist
                 </div>
                 <div className="fw-semibold text-dark" style={{ fontSize: "1.05rem" }}>
                   {staffName}
                 </div>
               </div>
             </div>
       </Card.Body>
     </Card>
     </Col>
     </Row>
   );
}

export default CanceledAppointCard