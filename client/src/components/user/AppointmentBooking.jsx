import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert, ToggleButton, ButtonGroup, Container, Card } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../../context/AuthContext';
import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';

const AppointmentBooking = () => {
  const [services] = useState(['Hair Styling', 'Nail Care', 'Skin Treatment', 'Makeup']);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const [radioValue, setRadioValue] = useState('upi');

  const radios = [
    { name: 'UPI', value: 'upi' },
    { name: 'Wallet', value: 'wallet' },
  ];

  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    return currentDate.getTime() < selectedDate.getTime();
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h3 className="text-center mb-4">Book Your Appointment</h3>
          <h5 className="text-muted mb-4">Welcome, {currentUser.name}!</h5>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Select Service</Form.Label>
              <Form.Select 
                value={selectedService} 
                onChange={(e) => setSelectedService(e.target.value)}
                className="py-2"
              >
                <option value="">Choose a service...</option>
                {services.map((service, idx) => (
                  <option key={idx} value={service}>
                    {service}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Select Date</Form.Label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={setSelectedDate}
                    minDate={new Date()}
                    className="form-control py-2"
                    placeholderText="Pick a date"
                    dateFormat="MMMM d, yyyy"
                  />
                </Form.Group>
              </div>
              
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Select Time</Form.Label>
                  <DatePicker
                    selected={selectedTime}
                    onChange={setSelectedTime}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={30}
                    minTime={setHours(setMinutes(new Date(), 0), 9)}
                    maxTime={setHours(setMinutes(new Date(), 0), 21)}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    filterTime={filterPassedTime}
                    className="form-control py-2"
                    placeholderText="Choose time"
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Payment Mode</Form.Label>
              <div>
                <ButtonGroup className="w-100">
                  {radios.map((radio, idx) => (
                    <ToggleButton
                      key={idx}
                      id={`radio-${idx}`}
                      type="radio"
                      variant={idx % 2 ? 'outline-primary' : 'outline-success'}
                      name="radio"
                      value={radio.value}
                      checked={radioValue === radio.value}
                      onChange={(e) => setRadioValue(e.currentTarget.value)}
                      className="py-2"
                    >
                      {radio.name}
                    </ToggleButton>
                  ))}
                </ButtonGroup>
              </div>
            </Form.Group>

            <div className="text-center">
              <Button
                size="lg"
                className="px-5"
                disabled={!selectedService || !selectedDate || !selectedTime}
                variant="primary"
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AppointmentBooking;