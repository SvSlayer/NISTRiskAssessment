// src/components/BarChart.jsx
import React from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ chartData, titleText }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: titleText,
      },
    },
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Jumlah Risiko',
        data: chartData.data,
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
      },
    ],
  };

  return <Bar options={options} data={data} />;
};

export default BarChart;