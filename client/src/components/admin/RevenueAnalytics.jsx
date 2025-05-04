import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Table, Container, Card, Spinner, Alert } from 'react-bootstrap';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueAnalytics = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { authToken } = useAuth();
  const [revenue, setRevenue] = useState(null);
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      setError("");
      try {
        const { data: response } = await axios.get(
          `${BASE_URL}/payment/admin/revenue`,
          {
            headers: { Authorization: authToken },
          }
        );
        setRevenue(response.data);

        setData({
          labels: [
            "Hair Service",
            "Nail Service",
            "Skincare Service",
            "Makeup Service",
          ],
          datasets: [
            {
              label: "Revenue (₹)",
              data: [
                response.data?.hairServiceRevenue || 0,
                response.data?.nailServiceRevenue || 0,
                response.data?.skincareServiceRevenue || 0,
                response.data?.makeupServiceRevenue || 0,
              ],
              backgroundColor: [
                "rgba(255, 99, 132, 0.6)",
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        setError("Failed to fetch revenue data. Please try again later.");
        console.error("Error fetching revenue:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, [BASE_URL, authToken]);

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white text-center">
          <h4 className="mb-0">Revenue Analytics</h4>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Revenue Type</th>
                <th className="text-end">Revenue Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Revenue</td>
                <td className="text-end">₹{revenue?.totalRevenue.toLocaleString() || 0}</td>
              </tr>
              <tr>
                <td>Hair Service Revenue</td>
                <td className="text-end">
                  ₹{revenue?.hairServiceRevenue.toLocaleString() || 0}
                </td>
              </tr>
              <tr>
                <td>Nail Service Revenue</td>
                <td className="text-end">
                  ₹{revenue?.nailServiceRevenue.toLocaleString() || 0}
                </td>
              </tr>
              <tr>
                <td>Skin Service Revenue</td>
                <td className="text-end">
                  ₹{revenue?.skincareServiceRevenue.toLocaleString() || 0}
                </td>
              </tr>
              <tr>
                <td>Make-Up Service Revenue</td>
                <td className="text-end">
                  ₹{revenue?.makeupServiceRevenue.toLocaleString() || 0}
                </td>
              </tr>
              <tr>
                <td>Total Refunds</td>
                <td className="text-end">₹{revenue?.totalRefunds.toLocaleString() || 0}</td>
              </tr>
            </tbody>
          </Table>
          <Bar data={data} />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RevenueAnalytics;