import { useQuery } from "@tanstack/react-query";
import { getAllExperiments, ExperimentsListResponse } from "@/lib/experiments";

export function useExperiments() {
  return useQuery<ExperimentsListResponse, Error>({
    queryKey: ["experiments"],
    queryFn: getAllExperiments,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
