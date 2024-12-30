import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DailyPointsData } from '../../types/points';
import { formatPoints } from '../../utils/formatters';
import { getDateRange } from '../../utils/dateHelpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StackedPointsChartProps {
  data: DailyPointsData[];
  title?: string;
  height?: number;
}

export default function StackedPointsChart({ 
  data, 
  title = 'Points History', 
  height = 300 
}: StackedPointsChartProps) {
  // Get the date range for the chart
  const dates = getDateRange(7);
  
  // Create a map of existing data points
  const dataMap = new Map(
    data.map(item => [item.date, item])
  );

  // Fill in the data for all dates
  const chartData = dates.map(date => ({
    date,
    ...dataMap.get(date) || {
      bandwidthPoints: 0,
      referralPoints: 0
    }
  }));

  const datasets = {
    labels: chartData.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Bandwidth Points',
        data: chartData.map(item => item.bandwidthPoints),
        backgroundColor: 'rgb(59, 130, 246)', // Blue
        borderRadius: 4,
      },
      {
        label: 'Referral Points',
        data: chartData.map(item => item.referralPoints),
        backgroundColor: 'rgb(139, 92, 246)', // Purple
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => 
            `${context.dataset.label}: ${formatPoints(context.raw)}`,
          footer: (tooltipItems: any) => {
            const total = tooltipItems.reduce(
              (sum: number, item: any) => sum + item.raw,
              0
            );
            return `Total: ${formatPoints(total)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: (value: number) => formatPoints(value),
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div style={{ height: `${height}px` }}>
          <Bar data={datasets} options={options} />
        </div>
      </div>
    </div>
  );
}