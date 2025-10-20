"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Rect,
  Line,
} from "@react-pdf/renderer";
import { LLMResult } from "@/types/llm";
import { QualityMetric } from "@/types/metrics";

// Use system fonts to avoid font loading issues
// Font.register({
//   family: "Inter",
//   fonts: [
//     {
//       src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
//     },
//     {
//       src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
//       fontWeight: "bold",
//     },
//   ],
// });

// Create styles that exactly match your app's design
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#faf8f1",
    padding: 0,
    paddingTop: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 32,
    paddingHorizontal: 32,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#6b7280",
  },

  // ResponseBars Section - Exact match to your component
  responseSection: {
    marginBottom: 32,
  },
  responseSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  responseContainer: {
    // keep this as a wrapper only — rows will be explicit
    flexDirection: "column",
    paddingHorizontal: 10,
  },
  responseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  responseCard: {
    width: "48%",
    padding: 16,
    backgroundColor: "#faf8f1",
    borderRight: "1px dashed #b77466",
    justifyContent: "space-between",
  },
  responseCardSecond: {
    // for the second card in each row: remove right border
    borderRight: "none",
  },
  responseCardLast: {
    borderRight: "none",
  },
  responseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  modelInfo: {
    flexDirection: "column",
  },
  modelName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 2,
  },
  provider: {
    fontSize: 10,
    color: "#6b7280",
  },
  badges: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  badge: {
    fontSize: 8,
    color: "#374151",
    backgroundColor: "#f3f4f6",
    padding: "2px 6px",
    marginBottom: 4,
    borderRadius: 6,
  },
  badgeTemperature: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    border: "1px solid #f59e0b",
  },
  badgeTopP: {
    backgroundColor: "#ecfdf5",
    color: "#166534",
    border: "1px solid #22c55e",
  },
  responseText: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 1.5,
    marginBottom: 12,
    flex: 1,
  },
  responseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
    color: "#6b7280",
    marginTop: 12,
  },

  // QualityMetricsChart Section - Exact match to your component
  metricsSection: {
    marginTop: 32,
  },
  metricsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  metricsContainer: {
    paddingHorizontal: 32,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 24,
  },
  metricCard: {
    width: "30%",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  metricDescription: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 1.4,
  },
  chartContainer: {
    height: 200,
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  chartSvg: {
    width: "100%",
    height: 120,
    marginBottom: 8,
  },
  chartData: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 4,
  },
  chartAxis: {
    fontSize: 9,
    color: "#9ca3af",
    textAlign: "center",
  },
  chartBar: {
    fill: "#6366f1",
  },
  chartBarLabel: {
    fontSize: 8,
    fill: "#374151",
    textAnchor: "middle",
  },

  footer: {
    marginTop: 48,
    paddingTop: 20,
    borderTop: "1px solid #e5e7eb",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  footerText: {
    fontSize: 12,
    color: "#6b7280",
  },
});

interface InteractivePDFDocumentProps {
  llmResults: LLMResult[];
  metrics: QualityMetric[];
  experimentId?: string;
}

// Custom Chart Component for PDF
const BarChart = ({
  data,
  labels,
  title,
}: {
  data: number[];
  labels: string[];
  title: string;
}) => {
  const maxValue = Math.max(...data);
  const chartWidth = 200;
  const chartHeight = 100;
  const barWidth = chartWidth / data.length;
  const colors = [
    "#6366f1",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <Svg style={styles.chartSvg} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Chart bars */}
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * (chartHeight - 20);
          const x = index * barWidth + 5;
          const y = chartHeight - barHeight - 10;
          const color = colors[index % colors.length];

          return (
            <g key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth - 10}
                height={barHeight}
                fill={color}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <Text
                x={x + (barWidth - 10) / 2}
                y={y - 5}
                style={styles.chartBarLabel}
              >
                {value.toFixed(1)}
              </Text>
              <Text
                x={x + (barWidth - 10) / 2}
                y={chartHeight - 5}
                style={styles.chartBarLabel}
              >
                {labels[index]}
              </Text>
            </g>
          );
        })}

        {/* Y-axis line */}
        <Line
          x1={0}
          y1={chartHeight - 10}
          x2={chartWidth}
          y2={chartHeight - 10}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      </Svg>
      <Text style={styles.chartData}>
        Max: {maxValue.toFixed(2)} | Min: {Math.min(...data).toFixed(2)}
      </Text>
    </View>
  );
};

export const InteractivePDFDocument = ({
  llmResults,
  metrics,
  experimentId,
}: InteractivePDFDocumentProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>LLM Experiment Results</Text>
          {experimentId && (
            <Text style={styles.subtitle}>Experiment ID: {experimentId}</Text>
          )}
          <Text style={styles.date}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* ResponseBars Section - Exact match to your component */}
        <View style={styles.responseSection}>
          <Text style={styles.responseSectionTitle}>
            Response comparison (pick up to 3)
          </Text>
          <View style={styles.responseContainer}>
            {(() => {
              // chunk results into rows of two
              const rows: LLMResult[][] = [];
              for (let i = 0; i < llmResults.length; i += 2) {
                rows.push(llmResults.slice(i, i + 2));
              }

              return rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.responseRow}>
                  {row.map((result, colIndex) => {
                    const isSecond = colIndex === 1;
                    const globalIndex = rowIndex * 2 + colIndex;
                    const isLast = globalIndex === llmResults.length - 1;
                    return (
                      <View
                        key={globalIndex}
                        style={[
                          styles.responseCard,
                          isSecond && styles.responseCardSecond,
                          isLast && styles.responseCardLast,
                        ]}
                      >
                        {/* Model Info Header */}
                        <View style={styles.responseHeader}>
                          <View style={styles.modelInfo}>
                            <Text style={styles.modelName}>{result.model}</Text>
                            <Text style={styles.provider}>
                              {result.provider}
                            </Text>
                          </View>
                          <View style={styles.badges}>
                            <Text
                              style={[styles.badge, styles.badgeTemperature]}
                            >
                              temperature: {result.temperature}
                            </Text>
                            <Text style={[styles.badge, styles.badgeTopP]}>
                              top_p: {result.top_p}
                            </Text>
                          </View>
                        </View>

                        {/* Response Content */}
                        <Text style={styles.responseText}>
                          {result.response || "No response available"}
                        </Text>

                        {/* Footer with tokens and execution time */}
                        <View style={styles.responseFooter}>
                          <Text>tokens: {result.tokens_used || "—"}</Text>
                          <Text>{result.execution_time.toFixed(1)}s</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ));
            })()}
          </View>
        </View>
      </Page>

      {metrics && metrics.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.metricsSection}>
            <Text style={styles.metricsSectionTitle}>
              Quality Metrics Analysis
            </Text>
            <View style={styles.metricsContainer}>
              <View style={styles.metricsGrid}>
                {metrics.map((metric, index) => (
                  <View key={index} style={styles.metricCard}>
                    <Text style={styles.metricTitle}>{metric.name}</Text>
                    <Text style={styles.metricDescription}>
                      {metric.description}
                    </Text>
                    <BarChart
                      data={metric.plot.data}
                      labels={metric.plot.labels}
                      title={`${metric.plot.x_axis} vs ${metric.plot.y_axis}`}
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Page>
      )}

      <Page size="A4" style={styles.page}>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by LLM Lab - Experiment Analysis Tool
          </Text>
        </View>
      </Page>
    </Document>
  );
};
