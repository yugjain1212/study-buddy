import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StudySession {
  id: string;
  topic: string;
  duration_minutes: number;
  created_at: string;
  content?: any;
}

interface PerformanceChartProps {
  sessions: StudySession[];
}

// Group sessions by date and sum minutes
const aggregateByDate = (sessions: StudySession[]) => {
  const map: Record<string, number> = {};
  sessions.forEach((s) => {
    const date = new Date(s.created_at).toLocaleDateString();
    map[date] = (map[date] || 0) + s.duration_minutes;
  });
  const labels = Object.keys(map).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const data = labels.map((d) => map[d]);
  return { labels, data };
};

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ sessions }) => {
  if (sessions.length === 0) return null;
  const { labels, data } = aggregateByDate(sessions);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Minutes Studied",
        data,
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139,92,246,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "hsl(var(--foreground))",
        },
      },
      title: {
        display: false,
        text: "Study Time Trend",
        color: "hsl(var(--foreground))",
      },
      tooltip: {
        backgroundColor: "rgba(30,30,30,0.9)",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "hsl(var(--foreground))",
        },
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
      y: {
        ticks: {
          color: "hsl(var(--foreground))",
        },
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
    },
  } as const;

  return (
    <div className="w-full h-72">
      <Line options={options} data={chartData} />
    </div>
  );
};
