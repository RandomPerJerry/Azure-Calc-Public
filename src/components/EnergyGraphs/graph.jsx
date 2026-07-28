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
  plugins,
} from 'chart.js';

import { Line } from 'react-chartjs-2';
import { callback } from "chart.js/helpers";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * @typedef {Object} DataPoint
 * @property {number} x - x-axis value (time, distance, etc.)
 * @property {number} y - y-axis value
 */

/**
 * @typedef {Object} DataSeries
 * @property {string} name - name/label of the data series
 * @property {DataPoint[]} data - array of {x, y} coordinate objects
 */

/**
 * @param {DataSeries[]} data - array of data series with x,y coordinates for multi-line graph
 * @param {Object} label - label configuration for the graph
 * @param {string} label.xAxis - x-axis label
 * @param {string} label.yAxis - y-axis label
 */

function MultiLineGraph({ data, label }) {
  const chartData = {
    datasets: data.map((series, index) => {
      const hasInitialPoint = series.data.some(point => point.x === 0);

      if (hasInitialPoint) {
        return {
          label: series.name,
          data: series.data, // expects [{x: 1, y: 10}, {x: 2, y: 15}, ...]
          borderColor: `hsl(${index * 137.5}, 70%, 50%)`, // different colors
          backgroundColor: `hsla(${index * 137.5}, 70%, 50%, 0.1)`,
          pointRadius: 3,
        }
      }

      const newData = [{name: 'start', x: 0, y: 100}, ...series.data];
      return {
        label: series.name,
        data: newData,
        borderColor: `hsl(${index * 137.5}, 70%, 50%)`, // different colors
        backgroundColor: `hsla(${index * 137.5}, 70%, 50%, 0.1)`,
        pointRadius: 3,
      }
    })
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ← Change this to false
    scales: {
      x: {
        type: 'linear', // important for non-uniform x spacing
        position: 'bottom',
        min: 0,
        title: {
          display: true,
          text: label.xAxis || 'X Axis'
        }
      },
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: label.yAxis || 'Y Axis'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: label.title || "Title"
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            const point = context[0];
            return point.raw.name;
          },
          label: function(context) {
            const value = context.parsed.y;
            return [
              `SOC: ${value.toFixed(2)}%`,
              `Range: ${context.parsed.x.toFixed(2)}nm`
            ];
          }
        }
      }
    }
  };

  return <Line data={chartData} options={options}/>;
}

export default MultiLineGraph;