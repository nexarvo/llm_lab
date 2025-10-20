"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChatBox } from "../components/ChatBox";
import ResponseBars from "../components/ResponseBars";
import QualityMetricsChart from "../components/QualityMetricsChart";
import { useMetrics } from "../hooks/useMetrics";
import { useChatStore } from "../store/chatStore";

export default function ChatScreen() {
  const firstTimeSend = useChatStore((s) => s.firstTimeSend);
  const isTransitioning = useChatStore((s) => s.isTransitioning);
  const isLoading = useChatStore((s) => s.isLoading);
  const currentExperimentId = useChatStore((s) => s.currentExperimentId);
  const llmResults = useChatStore((s) => s.llmResults);
  const setFirstTimeSend = useChatStore((s) => s.setFirstTimeSend);
  const setIsTransitioning = useChatStore((s) => s.setIsTransitioning);

  // Fetch metrics for the current experiment AFTER experiment data is available
  const enableMetrics = !!currentExperimentId && llmResults;
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useMetrics(enableMetrics ? currentExperimentId : null);

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
            transition={{ duration: 0.3, ease: "easeOut" }}
            onAnimationComplete={() => {
              setIsTransitioning(false);
              setFirstTimeSend(false);
            }}
            className="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary z-50"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={`transition-all duration-800 ${
          !firstTimeSend
            ? "pt-8 pb-48 flex flex-col items-center justify-start"
            : "flex items-center justify-center h-screen"
        }`}
      >
        {firstTimeSend && <ChatBox className="max-w-xl w-full" />}

        {!firstTimeSend && (
          <>
            <div className="max-w-7xl w-full flex-1 flex flex-col items-center justify-center mb-8 space-y-8">
              <ResponseBars data={llmResults} />
              {currentExperimentId && (
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
                      experimentId={currentExperimentId}
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
