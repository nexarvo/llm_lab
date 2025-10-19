"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatBox } from "../components/ChatBox";
import ResponseBars from "../components/ResponseBars";
import QualityMetricsChart from "../components/QualityMetricsChart";
import { useMetrics } from "../hooks/useMetrics";

export default function ChatScreen() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [experimentId, setExperimentId] = useState<string | null>(null);

  // Fetch metrics for the current experiment
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useMetrics(experimentId);

  const handleFirstSend = () => {
    if (hasStarted) return;
    setIsTransitioning(true);
    // Set a mock experiment ID for now - in real implementation this would come from the API response
    setExperimentId("90e34ebbccab4b969124b9af243e7ebc");
    // Delay the final transition after animation
    setTimeout(() => {
      setHasStarted(true);
      setIsTransitioning(false);
    }, 800); // Adjust based on animation duration
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
          <ChatBox onFirstSend={handleFirstSend} className="max-w-xl w-full" />
        )}

        {hasStarted && (
          <>
            <div className="max-w-7xl w-full flex-1 flex flex-col items-center justify-center mb-8 space-y-8">
              <ResponseBars />
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
                  {metrics && metrics.length > 0 && (
                    <QualityMetricsChart
                      metrics={metrics}
                      experimentId={experimentId}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="fixed bottom-0 w-full flex justify-center scale-90">
              <ChatBox className="max-w-md w-full" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
