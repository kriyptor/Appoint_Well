import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Form, 
  Button, 
  Spinner, 
  Alert, 
  ToggleButton, 
  ButtonGroup, 
  Container, 
  Card, 
  Row, 
  Col,
  Badge
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../../context/AuthContext';
import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';
import { addDays, isSameDay, addHours, format, isAfter, startOfDay } from 'date-fns';
import { load } from '@cashfreepayments/cashfree-js';

// Custom style to fix z-index
const customDatePickerStyle = `
  .react-datepicker-popper {
    z-index: 9999 !important;
  }
`;

const AppointmentBooking = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { authToken, currentUser, walletBalance } = useAuth();

  const [fetchedServicesData, setFetchedServicesData] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // ISO string date
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [radioValue, setRadioValue] = useState('upi');
  const [orderId, setOrderId] = useState('');
  const [cashfree, setCashfree] = useState(null);


  const paymentOptions = [
    { name: 'UPI', value: 'upi', variant: 'outline-success' },
    { name: 'Wallet', value: 'wallet', variant: 'outline-primary' },
  ];

  // Determine minimum selectable time
  const getMinTime = (date) => {
    const now = new Date();
    const selDate = new Date(date);
    const salonClosingTime = setHours(setMinutes(selDate, 0), 19);

    if (isSameDay(selDate, now)) {
      const oneHourLater = addHours(now, 1);
      oneHourLater.setMinutes(0, 0, 0);

      if (isAfter(oneHourLater, salonClosingTime)) {
        setError('Salon is closed today. Auto-selected tomorrow.');
        const tomorrow = addDays(now, 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]);
        setSelectedTime(null);
        return setHours(setMinutes(tomorrow, 0), 9);
      }

      if (oneHourLater.getHours() < 9) {
        return setHours(setMinutes(selDate, 0), 9);
      }

      return setHours(setMinutes(selDate, 0), oneHourLater.getHours());
    }

    return setHours(setMinutes(selDate, 0), 9);
  };

  // Maximum selectable time for any date
  const getMaxTime = (date) => {
    const selDate = new Date(date);
    return setHours(setMinutes(selDate, 0), 19);
  };

  // Validate date selection
  const handleDateChange = (date) => {
    const now = new Date();
    const selDate = new Date(date);
    const salonClosingTime = setHours(setMinutes(selDate, 0), 19);

    if (isSameDay(selDate, now) && isAfter(now, salonClosingTime)) {
      setError('Salon is closed today. Auto-selected tomorrow.');
      const tomorrow = addDays(now, 1);
      setSelectedDate(tomorrow.toISOString().split('T')[0]);
      setSelectedTime(null);
      return;
    }

    setError('');
    setSelectedDate(selDate.toISOString().split('T')[0]);
    setSelectedTime(null);
  };

  // Load Cashfree SDK
  const initializeSDK = async () => {
    const cashfreeInstance = await load({
      mode: "sandbox",
    });
    setCashfree(cashfreeInstance);
  };

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      setFetchLoading(true);
      try {
        const { data } = await axios.get(`${BASE_URL}/service/get-all-services-data`, {
          headers: { Authorization: authToken }
        });
        if (data.data) setFetchedServicesData(data.data);
        else setError('Unable to load services');
      } catch {
        setError('Failed to load services. Try again later.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchServices();
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


  // Create appointment
  const handleCreateAppointment = async () => {

    if (!selectedService || !selectedDate || !selectedTime) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formattedTime = selectedTime.toTimeString().split(' ')[0];
      const res = await axios.post(`${BASE_URL}/appointment/create`,
        {
          serviceId: selectedService.id,
          date: selectedDate,
          startTime: formattedTime,
          price: selectedService.price,
          paymentMode: radioValue,
          category: selectedService.category,
          paymentStatus: 'paid',
        },
        { headers: { Authorization: authToken } }
      );
      if (res.status === 201) {
        setSuccess('Appointment booked successfully!');
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
    } finally {
      setLoading(false);
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
    <Container className="py-5">
      <style>{customDatePickerStyle}</style>
      <Card className="shadow">
        <Card.Header className="bg-primary text-white py-3">
          <h3 className="mb-0 text-center">Book Your Appointment</h3>
        </Card.Header>
        <Card.Body className="p-4">
          <div className="mb-4 text-center">
            <h5>Welcome, {currentUser.name}!</h5>
            <p className="text-muted">Select your service and time</p>
          </div>

          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" onClose={() => setSuccess("")} dismissible>
              {success}
            </Alert>
          )}

          {fetchLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3">Loading services...</p>
            </div>
          ) : (
            <Form>
              {/* Service Selection */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Service</Form.Label>
                <Form.Select
                  value={selectedService?.id || ""}
                  onChange={(e) => {
                    const svc = fetchedServicesData.find(
                      (s) => s.id === e.target.value
                    );
                    setSelectedService(svc || null);
                  }}
                  required
                >
                  <option value="">Choose...</option>
                  {fetchedServicesData.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} - ₹{s.price}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Date & Time */}
              <Row className="mb-4">
                <Col>
                  <Form.Group>
                    <Form.Label className="fw-bold">Date</Form.Label>
                    <DatePicker
                      selected={selectedDate ? new Date(selectedDate) : null}
                      onChange={handleDateChange}
                      minDate={new Date()}
                      maxDate={addDays(new Date(), 30)}
                      dayClassName={(d) =>
                        d.getDay() % 6 === 0 ? "weekend-day" : undefined
                      }
                      className="form-control py-2"
                      placeholderText="Pick a date"
                      dateFormat="dd-MM-yyyy"
                      required
                      popperProps={{ positionFixed: true }}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label className="fw-bold">Time</Form.Label>
                    <DatePicker
                      selected={selectedTime}
                      onChange={setSelectedTime}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      minTime={
                        selectedDate
                          ? getMinTime(selectedDate)
                          : setHours(setMinutes(new Date(), 0), 9)
                      }
                      maxTime={
                        selectedDate
                          ? getMaxTime(selectedDate)
                          : setHours(setMinutes(new Date(), 0), 19)
                      }
                      dateFormat="h:mm aa"
                      timeCaption="Time"
                      className="form-control py-2"
                      placeholderText="Choose time"
                      required
                      disabled={!selectedDate}
                      popperProps={{ positionFixed: true }}
                    />
                    {selectedDate && (
                      <Form.Text className="text-muted">
                        {isSameDay(new Date(selectedDate), new Date())
                          ? `Available: ${format(
                              addHours(new Date(), 1),
                              "h:mm aa"
                            )} - 7:00 PM`
                          : "Available: 9:00 AM - 7:00 PM"}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>

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

              {/* Summary & Confirm */}
              {selectedService && selectedDate && selectedTime && (
                <Card className="mb-4 border-success">
                  <Card.Header className="bg-success text-white">
                    Summary
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col sm={6}>
                        <p>
                          <strong>Service:</strong> {selectedService.title}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(selectedDate).toLocaleDateString()}
                        </p>
                      </Col>
                      <Col sm={6} className="text-sm-end">
                        <p>
                          <strong>Time:</strong>{" "}
                          {format(selectedTime, "h:mm aa")}
                        </p>
                        <p>
                          <strong>Payment:</strong> {radioValue.toUpperCase()}{" "}
                          <Badge bg="success">Ready</Badge>
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              <div className="text-center">
                <Button
                  size="lg"
                  className="px-5"
                  onClick={handleAppointmentBooking}
                  disabled={
                    !selectedService ||
                    !selectedDate ||
                    !selectedTime ||
                    loading
                  }
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
        <Card.Footer className="text-center text-muted py-3">
          <small>Need help? Contact support@example.com</small>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default AppointmentBooking;