import React, { useState, useEffect } from 'react';
import { Carousel, Card } from 'react-bootstrap';
import mockApi from '../../mockData';

const ServiceShowcase = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const res = await mockApi.getServices();
      setServices(res);
    };
    fetchServices();
  }, []);

  return (
    <div>
      <h2>Our Services</h2>
      <Carousel>
        {services.map((service) => (
          <Carousel.Item key={service.id}>
            <Card>
              <Card.Body>
                <Card.Title>{service.name}</Card.Title>
                <Card.Subtitle>{service.category}</Card.Subtitle>
                <Card.Text>
                  Price: ${service.price} | Duration: {service.duration} mins
                  <br />
                  {service.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default ServiceShowcase;