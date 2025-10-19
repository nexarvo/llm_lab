"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatBox } from "../components/ChatBox";
import ResponseBars from "../components/ResponseBars";
import QualityMetricsChart from "../components/QualityMetricsChart";
import { useMetrics } from "../hooks/useMetrics";
import { LLMResult } from "@/types/llm";
import { useExperiment } from "../hooks/useExperiment";

export default function ChatScreen() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [llmResults, setLlmResults] = useState<LLMResult[]>([]);
  const { data: experimentData } = useExperiment(experimentId);

  // Persist experiment id in localStorage to survive refreshes
  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem("experiment_id")
        : null;
    if (saved && !experimentId) {
      setExperimentId(saved);
      setHasStarted(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && experimentId) {
      window.localStorage.setItem("experiment_id", experimentId);
    }
  }, [experimentId]);

  // Fetch metrics for the current experiment AFTER experiment data is available
  const enableMetrics =
    llmResults ||
    (!!experimentId &&
      !!experimentData &&
      !!experimentData.llm_results?.length);
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useMetrics(enableMetrics ? experimentId : null);

  const handleFirstSend = () => {
    if (hasStarted) return;
    setIsTransitioning(true);
    // experimentId will be set from the first LLM response
    // Delay the final transition after animation
    setTimeout(() => {
      setHasStarted(true);
      setIsTransitioning(false);
    }, 800);
  };

  const handleResults = (results: LLMResult[], newExperimentId?: string) => {
    if (newExperimentId) {
      setExperimentId(newExperimentId);
    }
    if (results) {
      setLlmResults(results);
      console.log("LLM Results received:", results);
    }
    // Ensure UI transitions to results view as soon as results arrive
    if (!hasStarted) {
      setHasStarted(true);
    }
    if (isTransitioning) {
      setIsTransitioning(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Expanding Circle */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="expanding-circle"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 100, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary z-50"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={`transition-all duration-800 ${
          hasStarted
            ? "pt-8 pb-48 flex flex-col items-center justify-start"
            : "flex items-center justify-center h-screen"
        }`}
      >
        {!hasStarted && (
          <ChatBox
            onFirstSend={handleFirstSend}
            onResults={handleResults}
            className="max-w-xl w-full"
          />
        )}

        {hasStarted && (
          <>
            <div className="max-w-7xl w-full flex-1 flex flex-col items-center justify-center mb-8 space-y-8">
              <ResponseBars
                isLoading
                data={
                  experimentData?.llm_results?.length
                    ? experimentData.llm_results
                    : llmResults
                }
              />
              {experimentId && (
                <div className="w-full">
                  {metricsLoading && (
                    <div className="w-full p-8 text-center text-muted-foreground">
                      <p>Loading quality metrics...</p>
                    </div>
                  )}
                  {metricsError && (
                    <div className="w-full p-8 text-center text-destructive">
                      <p>Error loading metrics: {metricsError.message}</p>
                    </div>
                  )}
                  {!isLoading && metrics && metrics.length > 0 && (
                    <QualityMetricsChart
                      metrics={metrics}
                      experimentId={experimentId}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="fixed bottom-0 w-full flex justify-center">
              <ChatBox
                onResults={handleResults}
                setIsLoading={setIsLoading}
                className="max-w-md w-full"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
