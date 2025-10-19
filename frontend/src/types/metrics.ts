export interface QualityMetric {
  name: string;
  description: string;
  value: number[];
  graph: string;
  plot: {
    x_axis: string;
    y_axis: string;
    data: number[];
    labels: string[];
  };
}

export interface ExperimentMetrics {
  experiment_id: string;
  response_count: number;
  average_metrics: QualityMetric[];
}
