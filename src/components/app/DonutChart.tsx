import { canvasColor } from '@/lib/colors';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

// Custom plugin for displaying text in the center of the donut chart
const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: function (chart: any) {
      const { ctx, chartArea: { width, height } } = chart;
  
      // Ensure the plugin configuration and totalProblems exist before proceeding
      const totalProblems =
        chart.config.options.plugins?.centerText?.totalProblems ?? null;
  
      // Only proceed if totalProblems is valid
      if (totalProblems !== null) {
        // Set font styles for the text
        ctx.save();
        ctx.font = 'bold 46px Arial';
        ctx.fillStyle = canvasColor('foreground'); // Text color
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
  
        // Calculate the center of the chart
        const centerX = width / 2;
        const centerY = height / 2;
  
        // Draw the text (total number of problems)
        ctx.fillText(totalProblems, centerX, centerY);
        ctx.restore();
      }
    },
  };

// Register the custom plugin with Chart.js
ChartJS.register(centerTextPlugin);

interface DonutChartProps {
  labels: string[];
  data: number[];
  backgroundColors: string[];
}

const DonutChart: React.FC<DonutChartProps> = ({ labels, data, backgroundColors }) => {
  // Calculate the total number of problems
  const totalProblems = data.reduce((acc, currentValue) => acc + currentValue, 0);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: backgroundColors,
        hoverOffset: 4,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    cutout: '90%', // Adjust this value to make the rings thinner
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: canvasColor('chart-legend'),
          padding: 20,
          boxWidth: 10,
          usePointStyle: true,
        },
        align: 'center' as const,
      },
      centerText: {
        totalProblems: totalProblems, // Pass the total number to the custom plugin
      },
    },
    layout: {
      padding: {
        bottom: 20,
      },
    },
  };

  return (
    <div style={{ width: '250px', height: '250px' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DonutChart;
