import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import mockApi from '../../mockData';

const AppointmentBooking = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await mockApi.getServices();
        setServices(res);
      } catch (err) {
        setError('Failed to load services');
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate) {
      setLoading(true);
      const fetchTimeSlots = async () => {
        try {
          const res = await mockApi.getAvailability();
          setTimeSlots(res);
        } catch (err) {
          setError('Failed to load time slots');
        }
        setLoading(false);
      };
      fetchTimeSlots();
    }
  }, [selectedService, selectedDate]);

  const handleBooking = async () => {
    try {
      await mockApi.bookAppointment({
        serviceId: selectedService,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
      });
      alert('Booking confirmed!');
      setSelectedService('');
      setSelectedDate(null);
      setSelectedTime('');
    } catch (err) {
      setError('Booking failed');
    }
  };

  return (
    <div>
      <h2>Book Appointment</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form>
        <Form.Group>
          <Form.Label>Service</Form.Label>
          <Form.Select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
            <option value="">Select Service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category})
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label>Date</Form.Label>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
            className="form-control"
          />
        </Form.Group>
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Form.Group>
            <Form.Label>Time</Form.Label>
            <Form.Select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
              <option value="">Select Time</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}
        <Button
          className="mt-3"
          onClick={handleBooking}
          disabled={!selectedService || !selectedDate || !selectedTime}
        >
          Confirm Booking
        </Button>
      </Form>
    </div>
  );
};

export default AppointmentBooking;