import { useQuery } from "@tanstack/react-query";
import { getExperimentMetrics } from "@/lib/metrics";
import { QualityMetric } from "@/types/metrics";

export function useMetrics(experimentId: string | null) {
  return useQuery<QualityMetric[], Error>({
    queryKey: ["metrics", experimentId],
    queryFn: () => getExperimentMetrics(experimentId!),
    enabled: !!experimentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
