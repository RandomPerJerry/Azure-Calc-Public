// Graph.js
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const Graph = ({ data, label, width = 500, height = 500 }) => {
  
  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    const sortedData = [...data].sort((a, b) => a.x - b.x);
    setSortedData(sortedData);
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: label.x
        },
        ticks: {
          stepSize: sortedData.length > 1 ? Math.ceil(Math.max(...sortedData.map(element => element.x)) / 10) : 2,
          autoSkip: false
        },
        min: 0
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: label.y
        },
        ticks: {
          stepSize: sortedData.length > 1 ? Math.ceil(Math.max(...sortedData.map(element => element.y)) / 10) : 2,
          autoSkip: false
        },
        min: 0
      }
    },
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      title: {
        display: true,
        text: label.title
      }
    }
  }

  const chartData = {
    datasets: [
      {
        label: label.data,
        data: sortedData.map(item => ({ x: item.x, y: item.y })),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0  // line curved
      }
    ]
  };

  return (
    <div className="graph-container">
      <Line options={options} data={chartData}/>
    </div>
  );
};

export default Graph;