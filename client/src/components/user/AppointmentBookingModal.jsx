import { useState } from "react";
import { Button, ButtonGroup, ToggleButton, Modal, Form, Spinner, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../context/AuthContext";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import axios from "axios";
import {
  addDays,
  isSameDay,
  addHours,
  format,
  isAfter,
  startOfDay,
} from "date-fns";

function AppointmentBookingModal({ show, setShow, selectedService }) {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  return (
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
              maxDate={addDays(new Date(), 30)}
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
          onClick={handleCreateAppointment}
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
  );
}

export default AppointmentBookingModal;
