import React from 'react';
import {
  Line,
  Bar,
  Pie,
  Doughnut,
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';

export interface ChartProps {
  type: ChartType;
  data: any;
  options?: any;
  height?: number;
}

export const Chart: React.FC<ChartProps> = ({ type, data, options, height = 300 }) => {
  const ChartComponent = {
    line: Line,
    bar: Bar,
    pie: Pie,
    doughnut: Doughnut,
  }[type];

  return (
    <div style={{ height }}>
      <ChartComponent
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom' as const,
            },
          },
          ...options,
        }}
      />
    </div>
  );
}; 