"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { QualityMetric } from "@/types/metrics";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface QualityMetricsChartProps {
  metrics: QualityMetric[];
  experimentId: string;
}

export default function QualityMetricsChart({
  metrics,
  experimentId,
}: QualityMetricsChartProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="w-full p-8 text-center text-muted-foreground">
        <p>No quality metrics available for this experiment.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="px-8 mb-4 text-lg font-semibold">
        Quality Metrics Analysis
      </h3>

      <div className="max-w-7xl mx-auto px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => {
            const chartData = {
              labels: metric.plot.labels,
              datasets: [
                {
                  label: metric.name,
                  data: metric.plot.data,
                  backgroundColor: [
                    "rgba(99, 102, 241, 0.4)", // Indigo
                    "rgba(34, 197, 94, 0.4)", // Green
                    "rgba(245, 158, 11, 0.4)", // Amber
                    "rgba(239, 68, 68, 0.4)", // Red
                    "rgba(139, 92, 246, 0.4)", // Purple
                    "rgba(6, 182, 212, 0.4)", // Cyan
                  ],
                  borderColor: [
                    "rgba(99, 102, 241, 1)",
                    "rgba(34, 197, 94, 1)",
                    "rgba(245, 158, 11, 1)",
                    "rgba(239, 68, 68, 1)",
                    "rgba(139, 92, 246, 1)",
                    "rgba(6, 182, 212, 1)",
                  ],
                  borderWidth: 1,
                },
              ],
            };

            const options = {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: false,
                  text: metric.name,
                  font: {
                    size: 16,
                    weight: "bold" as const,
                  },
                },
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    title: (context: any) => {
                      return context[0].label;
                    },
                    label: (context: any) => {
                      return `${metric.name}: ${context.parsed.y}`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: metric.plot.x_axis,
                  },
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: metric.plot.y_axis,
                  },
                  beginAtZero: true,
                },
              },
            };

            return (
              <div key={index} className="bg-white border rounded-lg p-4">
                <div className="h-64">
                  <Bar data={chartData} options={options} />
                </div>
                <div className="mt-8">
                  <h4 className="text-xs font-xs text-muted-foreground">
                    {metric.description}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
