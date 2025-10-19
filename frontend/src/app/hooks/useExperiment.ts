import { useQuery } from "@tanstack/react-query";
import { getExperimentById, ExperimentResponse } from "@/lib/experiments";

export function useExperiment(experimentId: string | null) {
  return useQuery<ExperimentResponse, Error>({
    queryKey: ["experiment", experimentId],
    queryFn: () => getExperimentById(experimentId!),
    enabled: !!experimentId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
