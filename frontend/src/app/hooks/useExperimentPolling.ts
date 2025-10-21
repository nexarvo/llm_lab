import { useEffect, useCallback, useRef } from "react";
import { getExperimentStatus, ExperimentStatus } from "@/lib/llm";
import { useChatStore } from "@/app/store/chatStore";

interface UseExperimentPollingOptions {
  experimentId: string | null;
  pollInterval?: number; // in milliseconds
  onComplete?: (status: ExperimentStatus) => void;
  onError?: (error: string) => void;
}

interface UseExperimentPollingReturn {
  status: ExperimentStatus | null;
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useExperimentPolling = ({
  experimentId,
  pollInterval = 2000, // 2 seconds default
  onComplete,
  onError,
}: UseExperimentPollingOptions): UseExperimentPollingReturn => {
  // Use chat store for state management
  const {
    experimentStatusData: status,
    isPolling,
    pollingError: error,
    setExperimentStatusData: setStatus,
    setIsPolling,
    setPollingError: setError,
    setResults,
    setIsLoading,
    setOriginalPrompt,
  } = useChatStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  // Internal ref to track whether polling is actively running (local to this hook)
  const pollingActiveRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    if (!experimentId || !isMountedRef.current) return;

    console.count("fetchStatus called");

    try {
      console.log("fetchStatus");
      setError(null);

      const statusData = await getExperimentStatus(experimentId);

      if (!isMountedRef.current) return;

      setStatus(statusData);
      console.log("fetchStatus: got statusData", {
        experimentId,
        status: statusData.status,
      });

      // Check if experiment is complete
      if (
        statusData.status === "completed" ||
        statusData.status === "failed" ||
        statusData.status === "cancelled"
      ) {
        setIsPolling(false);
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
          intervalRef.current = null;
          console.log("clearing timer due to terminal status", experimentId);
        }
        pollingActiveRef.current = false;

        // Update results in store when completed
        if (statusData.status === "completed" && statusData.responses) {
          const results = statusData.responses.map((response) => ({
            provider: response.provider,
            model: response.model,
            temperature: response.temperature,
            top_p: response.top_p,
            response: response.response_text,
            tokens_used: response.tokens_used,
            execution_time: response.execution_time,
            success: response.success,
            error: response.error,
          }));

          setResults(results);
          setOriginalPrompt(statusData.original_message);
          setIsLoading(false);
        }

        if (onComplete) {
          onComplete(statusData);
        }
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch experiment status";
      setError(errorMessage);
      setIsLoading(false);
      console.log("fetchStatus: error", { experimentId, errorMessage });

      if (onError) {
        onError(errorMessage);
      }
    }
  }, [
    experimentId,
    onComplete,
    onError,
    setStatus,
    setIsPolling,
    setError,
    setResults,
  ]);

  const startPolling = useCallback(() => {
    // Avoid re-starting when already polling or timer exists
    if (!experimentId || pollingActiveRef.current || intervalRef.current)
      return;

    console.log("startPolling called", {
      experimentId,
      pollingActive: pollingActiveRef.current,
      isPolling,
    });

    // Defensive: clear any stale timer
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }

    pollingActiveRef.current = true;
    setIsPolling(true);
    setError(null);

    // Fetch immediately (fire-and-forget)
    void fetchStatus();

    // Then poll at a fixed cadence using a timeout loop to avoid overlaps
    const tick = async () => {
      await fetchStatus();
      if (!pollingActiveRef.current) return;
      intervalRef.current = setTimeout(tick, pollInterval);
    };
    intervalRef.current = setTimeout(tick, pollInterval);

    console.log("polling started", { experimentId, pollInterval });
  }, [experimentId, fetchStatus, pollInterval, setIsPolling, setError]);

  const stopPolling = useCallback(() => {
    console.log("stopPolling called", {
      experimentId,
      pollingActive: pollingActiveRef.current,
      isPolling,
    });
    // Local ref flip first
    pollingActiveRef.current = false;
    // Only update store if it was polling
    if (isPolling) setIsPolling(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    console.log("polling stopped", { experimentId });
  }, [setIsPolling, isPolling, experimentId]);

  // Track if polling already started for this experiment
  const hasStartedRef = useRef<string | null>(null);

  // Auto-start polling when experimentId changes — start only once per experimentId
  useEffect(() => {
    console.log("useEffect(poll): experimentId change", {
      experimentId,
      hasStarted: hasStartedRef.current,
      pollingActive: pollingActiveRef.current,
      isPolling,
    });
    if (experimentId && hasStartedRef.current !== experimentId) {
      hasStartedRef.current = experimentId;
      startPolling();
      console.log("useEffect: started polling for", experimentId);
    }

    if (!experimentId) {
      // Only reset markers — do not call stopPolling here to avoid races when
      // parent re-renders. stopPolling should be called explicitly on unmount or
      // when needed elsewhere.
      hasStartedRef.current = null;
      setStatus(null);
    }

    return () => {
      // no-op
    };
  }, [experimentId, startPolling, setStatus]);

  // Ensure mounted flag is correct across mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      pollingActiveRef.current = false;
      hasStartedRef.current = null;
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      console.log("unmount cleanup: cleared timer", { experimentId });
    };
  }, [experimentId]);

  return {
    status,
    isLoading: false, // We don't track loading state in the store for polling
    error,
    isPolling,
    startPolling,
    stopPolling,
  };
};
