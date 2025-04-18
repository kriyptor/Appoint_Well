import { useState, useEffect } from "react";
import { Button, Modal, Form, Spinner, Alert } from "react-bootstrap";
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

function RescheduleModal({ show, setShow, selectedAppt, onRescheduleSuccess }) {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { authToken } = useAuth();

  // Reset form when modal opens with new appointment
  useEffect(() => {
    if (show && selectedAppt) {
      setError("");
      setSuccess("");
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [show, selectedAppt]);

  const handleClose = () => {
    setShow(false);
    setError("");
    setSuccess("");
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const getMinTime = (date) => {
    const now = new Date();
    const selDate = new Date(date);
    const salonClosingTime = setHours(setMinutes(selDate, 0), 19);

    if (isSameDay(selDate, now)) {
      const oneHourLater = addHours(now, 1);
      oneHourLater.setMinutes(0, 0, 0);

      if (isAfter(oneHourLater, salonClosingTime)) {
        setError("Salon is closed today. Please select tomorrow.");
        setSelectedDate(null);
        return setHours(setMinutes(now, 0), 9);
      }

      return oneHourLater.getHours() < 9
        ? setHours(setMinutes(selDate, 0), 9)
        : setHours(setMinutes(selDate, 0), oneHourLater.getHours());
    }

    return setHours(setMinutes(selDate, 0), 9);
  };

  const getMaxTime = (date) => {
    const selDate = new Date(date);
    return setHours(setMinutes(selDate, 0), 19);
  };

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

  const handleRescheduleAppointment = async () => {
    if (!selectedAppt?.id || !selectedDate || !selectedTime) {
      setError("Please select both date and time");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formattedTime = format(selectedTime, 'HH:mm:ss');
      const response = await axios.patch(
        `${BASE_URL}/appointment/${selectedAppt.id}/reschedule`,
        {
          date: format(selectedDate, 'yyyy-MM-dd'),
          startTime: formattedTime,
        },
        { 
          headers: { 
            Authorization: authToken
          } 
        }
      );

      if (response.status === 200) {
        setSuccess("Appointment rescheduled successfully!");
        if (onRescheduleSuccess) {
          onRescheduleSuccess(response.data.data);
        }
        setTimeout(handleClose, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reschedule appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Reschedule Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Current Appointment</Form.Label>
            <Form.Control
              type="text"
              value={selectedAppt ? `${selectedAppt.title} - ${selectedAppt.date} ${selectedAppt.startTime}` : ''}
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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleRescheduleAppointment}
          disabled={loading || !selectedDate || !selectedTime}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Rescheduling...
            </>
          ) : (
            "Confirm Reschedule"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RescheduleModal;