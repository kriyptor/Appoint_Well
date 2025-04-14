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
import mockApi from '../../mockData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueAnalytics = () => {
  const [data, setData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchRevenue = async () => {
      const res = await mockApi.getRevenue();
      setData({
        labels: res.months,
        datasets: [
          {
            label: 'Revenue',
            data: res.values,
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 1,
          },
        ],
      });
    };
    fetchRevenue();
  }, []);

  return (
    <div>
      <h2>Revenue Analytics</h2>
      <Bar data={data} />
    </div>
  );
};

export default RevenueAnalytics;