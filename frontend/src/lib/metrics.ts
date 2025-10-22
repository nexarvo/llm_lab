import api from "./api";
import { QualityMetric } from "@/types/metrics";

export const getExperimentMetrics = async (
  experimentId: string
): Promise<QualityMetric[]> => {
  try {
    const response = await api.get(
      `/metrics/experiments/${experimentId}/quality`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching experiment metrics:", error);
    throw error;
  }
};
