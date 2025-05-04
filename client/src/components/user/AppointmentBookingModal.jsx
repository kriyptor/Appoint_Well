import { useEffect, useState } from "react";
import { Button, ButtonGroup, ToggleButton, Modal, Form, Spinner, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../context/AuthContext";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import { load } from '@cashfreepayments/cashfree-js';
import axios from "axios";
import {
  addDays,
  addMonths,
  isSameDay,
  addHours,
  format,
  isAfter,
  startOfDay,
} from "date-fns";

const customDatePickerStyle = `
  .react-datepicker-popper {
    z-index: 9999 !important;
  }
`;

function AppointmentBookingModal({ show, setShow, selectedService }) {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orderId, setOrderId] = useState('');
  const [cashfree, setCashfree] = useState(null);
  const { authToken } = useAuth();
  const [radioValue, setRadioValue] = useState("upi");

  const paymentOptions = [
    { name: "UPI", value: "upi", variant: "outline-success" },
    { name: "Wallet", value: "wallet", variant: "outline-primary" },
  ];

  const handleClose = () => {
    setShow(false);
    setError("");
    setSuccess("");
    setSelectedDate(null);
    setSelectedTime(null);
  };

    // Load Cashfree SDK
    const initializeSDK = async () => {
      const cashfreeInstance = await load({
        mode: "sandbox",
      });
      setCashfree(cashfreeInstance);
    };
  

  // Determine minimum selectable time
  const getMinTime = (date) => {
    const now = new Date();
    const selDate = new Date(date);
    const salonClosingTime = setHours(setMinutes(selDate, 0), 19);

    if (isSameDay(selDate, now)) {
      const oneHourLater = addHours(now, 1);
      oneHourLater.setMinutes(0, 0, 0);

      if (isAfter(oneHourLater, salonClosingTime)) {
        setError("Salon is closed today. Please select tomorrow.");
        return setHours(setMinutes(now, 0), 9);
      }

      return oneHourLater.getHours() < 9
        ? setHours(setMinutes(selDate, 0), 9)
        : setHours(setMinutes(selDate, 0), oneHourLater.getHours());
    }

    return setHours(setMinutes(selDate, 0), 9);
  };

  // Maximum selectable time
  const getMaxTime = (date) => {
    const selDate = new Date(date);
    return setHours(setMinutes(selDate, 0), 19);
  };

  // Handle date change
  const handleDateChange = (date) => {
    const now = new Date();
    const selDate = new Date(date);
    const salonClosingTime = setHours(setMinutes(selDate, 0), 19);

    if (isSameDay(selDate, now) && isAfter(now, salonClosingTime)) {
      setError("Salon is closed today. Please select tomorrow.");
      setSelectedDate(null);
      return;
    }

    setError("");
    setSelectedDate(date);
    setSelectedTime(null);
  };

  // Handle appointment creation
  const handleCreateAppointment = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setError("Please select both date and time");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formattedTime = selectedTime.toTimeString().split(" ")[0];
      const response = await axios.post(
        `${BASE_URL}/appointment/create`,
        {
          serviceId: selectedService.id,
          date: selectedDate.toISOString().split("T")[0],
          startTime: formattedTime,
          price: selectedService.price,
          paymentMode: "upi", // You can add payment options if needed
          category: selectedService.category,
          paymentStatus: "paid",
        },
        { headers: { Authorization: authToken } }
      );

      if (response.status === 201) {
        setSuccess("Appointment booked successfully!");
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeSDK();
  }, [BASE_URL, authToken]);

  /* ------Payments--------- */
  const getSessionId = async () => {
    try {
      
      const res = await axios.post(`${BASE_URL}/payment/user/create-session`, 
        { amount: selectedService.price },
        { headers: { Authorization: authToken } }
      );

      if (res.data && res.data.result.payment_session_id && res.data.result.order_id) {
        // Return both sessionId and orderId
        return {
          sessionId: res.data.result.payment_session_id,
          orderId: res.data.result.order_id
        };
      } else {
        console.warn("getSessionId: Missing payment_session_id or order_id in response");
        return null; // Or throw an error
      }
    } catch (error) {
      console.error("getSessionId error:", error);
      return null; // Or throw an error
    }
  };

    const handlePayment = async () => {
  
      try {
        //setLoading(true);
        const sessionData = await getSessionId();
  
        if (!sessionData) {
          console.error("handlePayment: Could not get session data");
          alert("Could not initiate payment. Please try again.");
          return;
        }
  
        const { sessionId, orderId } = sessionData;
        setOrderId(orderId); // Update the state here
  
        console.log("handlePayment: sessionId =", sessionId, "orderId =", orderId);
  
        const checkoutOptions = {
          paymentSessionId: sessionId,
          redirectTarget: "_modal",
        };
  
        cashfree.checkout(checkoutOptions).then((result) => {
          if(result.error){
            console.log("User closed the popup or payment error:", result.error);
          }
          if(result.redirect){
            console.log("Payment will be redirected");
          }
          if(result.paymentDetails){
            console.log("Payment completed, checking status");
            console.log("Payment details:", result.paymentDetails);
            console.log('orderId being sent for verification:', orderId);
  
            axios.post(`${BASE_URL}/payment/user/verify`, 
              { orderId },
              { headers: { Authorization: authToken } }
            ).then((res) => {
                console.log("Verification response:", res);
               
                if (res.status === 200 && res.data.success) {
                  handleCreateAppointment();
                }
              })
              .catch((err) => {
                console.error("Verification error:", err);
              });
          }
        });
      } catch (error) {
        console.error("handlePayment error:", error);
        alert("Payment failed. Please try again.");
      }
    };

    const handleAppointmentBooking = () => {
      if (radioValue === 'upi') {
        handlePayment();
      } else {
        handleCreateAppointment();
      }
    };

  return (
    <>
    <style>{customDatePickerStyle}</style>
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Book Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Selected Service</Form.Label>
            <Form.Control
              type="text"
              value={selectedService?.title || ""}
              disabled
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Price</Form.Label>
            <Form.Control
              type="text"
              value={selectedService?.price ? `₹${selectedService.price}` : ""}
              disabled
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Select Date: </Form.Label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              minDate={new Date()}
              maxDate={addMonths(new Date())} // Now dates available are up to 3 months ahead
              className="form-control"
              placeholderText="Choose date"
              dateFormat="dd/MM/yyyy"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Select Time: </Form.Label>
            <DatePicker
              selected={selectedTime}
              onChange={setSelectedTime}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              minTime={selectedDate ? getMinTime(selectedDate) : null}
              maxTime={selectedDate ? getMaxTime(selectedDate) : null}
              dateFormat="h:mm aa"
              timeCaption="Time"
              className="form-control"
              placeholderText="Choose time"
              disabled={!selectedDate}
              required
            />
            {selectedDate && (
              <Form.Text className="text-muted">
                Available: 9:00 AM - 7:00 PM
              </Form.Text>
            )}
          </Form.Group>
          {/* Payment */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Payment Method</Form.Label>
            <ButtonGroup className="w-100">
              {paymentOptions.map((opt, i) => (
                <ToggleButton
                  key={i}
                  id={`pay-${i}`}
                  type="radio"
                  variant={opt.variant}
                  name="payment"
                  value={opt.value}
                  checked={radioValue === opt.value}
                  onChange={(e) => setRadioValue(e.currentTarget.value)}
                >
                  {opt.name}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleAppointmentBooking}
          disabled={loading || !selectedDate || !selectedTime}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Booking...
            </>
          ) : (
            "Confirm Booking"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
}

export default AppointmentBookingModal;
