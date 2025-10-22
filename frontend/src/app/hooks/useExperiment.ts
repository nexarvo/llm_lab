import { useQuery } from "@tanstack/react-query";
import { getExperimentById, ExperimentResponse } from "@/lib/experiments";

export function useExperiment(experimentId: string | null) {
  return useQuery<ExperimentResponse, Error>({
    queryKey: ["experiment", experimentId],
    queryFn: () => getExperimentById(experimentId!),
    enabled: !!experimentId,
    staleTime: 0, // Always consider data stale, forcing a refetch
    refetchOnMount: true, // Always refetch when component mounts
    retry: 2,
  });
}
