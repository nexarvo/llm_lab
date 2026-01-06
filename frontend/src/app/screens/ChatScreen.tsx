"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChatBox } from "../components/ChatBox";
import ResponseBars from "../components/ResponseBars";
import QualityMetricsChart from "../components/QualityMetricsChart";
import { SideNavigation } from "../components/SideNavigation";
import { useMetrics } from "../hooks/useMetrics";
import { useChatStore } from "../store/chatStore";
import { exportChatScreenToPDF } from "@/lib/pdfExport";
import { Button } from "../components/ui/button";
import { Download, Github } from "lucide-react";
import { useState } from "react";
import ExperimentDetailScreen from "./ExperimentDetailScreen";
import APIKeysManagementScreen from "./APIKeysManagementScreen";

export default function ChatScreen() {
  const firstTimeSend = useChatStore((s) => s.firstTimeSend);
  const isTransitioning = useChatStore((s) => s.isTransitioning);
  const isLoading = useChatStore((s) => s.isLoading);
  const currentExperimentId = useChatStore((s) => s.currentExperimentId);
  const llmResults = useChatStore((s) => s.llmResults);
  const setFirstTimeSend = useChatStore((s) => s.setFirstTimeSend);
  const setIsTransitioning = useChatStore((s) => s.setIsTransitioning);

  const [isExporting, setIsExporting] = useState(false);
  const [selectedExperimentId, setSelectedExperimentId] = useState<
    string | null
  >(null);
  const [showKeysPage, setShowKeysPage] = useState(false);

  const enableMetrics = llmResults && llmResults.length > 0;
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useMetrics(enableMetrics ? currentExperimentId : null);

  const handleExportPDF = async () => {
    if (!llmResults || llmResults.length === 0) {
      alert("No results to export. Please generate some responses first.");
      return;
    }

    setIsExporting(true);
    try {
      await exportChatScreenToPDF(
        llmResults,
        metrics || [],
        currentExperimentId
      );
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExperimentSelect = (experimentId: string) => {
    setSelectedExperimentId(experimentId);
  };

  const handleBackToMain = () => {
    setSelectedExperimentId(null);
    setShowKeysPage(false);
  };

  const handleKeysPage = () => {
    setShowKeysPage(true);
  };

  // Show experiment detail screen if an experiment is selected
  if (selectedExperimentId) {
    return (
      <ExperimentDetailScreen
        experimentId={selectedExperimentId}
        onBack={handleBackToMain}
      />
    );
  }

  // Show keys page if requested
  if (showKeysPage) {
    return <APIKeysManagementScreen onBack={handleBackToMain} />;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#faf8f1] overflow-hidden">
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
            className="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b77466] z-50"
          />
        )}
      </AnimatePresence>

      {/* Top Navigation Bar - Landing Page Only */}
      {firstTimeSend && (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-full border border-neutral-200 shadow-sm px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#6B6B68FF]">LLM Lab</h1>
            </div>
            <div className="flex items-center">
              <a
                href="https://github.com/nexarvo/llm_lab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-800 ${
          !firstTimeSend
            ? "pt-8 pb-48 flex flex-col items-center justify-start"
            : "flex flex-col items-center justify-center pt-24 pb-8"
        }`}
      >
        {firstTimeSend && (
          <>
            <ChatBox className="max-w-xl w-full" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-16 w-full max-w-5xl px-4 flex flex-col items-center"
            >
              {/* Image Container with White Card */}
              <div className="w-full bg-orange-400/60 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-8 hover:shadow-[0_25px_70px_rgba(0,0,0,0.12)] transition-shadow duration-300">
                <div className="relative rounded-lg overflow-hidden border border-neutral-100">
                  <Image
                    src="/product-demo.png"
                    alt="Product Demo - LLM Lab interface showing side-by-side model comparison"
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                    priority
                  />
                  {/* Subtle accent border using brand color */}
                  <div className="absolute inset-0 border-2 border-white-600/40 pointer-events-none rounded-lg shadow-lg" />
                </div>
              </div>
            </motion.div>
          </>
        )}

        {!firstTimeSend && (
          <>
            {/* Side Navigation */}
            <SideNavigation
              onExperimentSelect={handleExperimentSelect}
              onKeysPage={handleKeysPage}
            />

            {/* Export Button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                onClick={handleExportPDF}
                disabled={
                  isLoading ||
                  isExporting ||
                  !llmResults ||
                  llmResults.length === 0
                }
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-emerald-200/50 text-emerald-800/70 hover:bg-emerald-300/50 hover:text-emerald-900/70"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
            </div>

            <div className="max-w-7xl w-full flex-1 flex flex-col items-center justify-center mb-8 space-y-8">
              <ResponseBars
                data={llmResults}
                isExperimentDetailScreen={false}
              />
              {currentExperimentId && !isLoading && (
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

      {/* Footer - Landing Page Only */}
      {firstTimeSend && (
        <footer className="w-full bg-white/80 backdrop-blur-sm border-t border-neutral-200 mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-[#3d3d3a] mb-4">LLM Lab</h3>
                <p className="text-sm text-neutral-600">
                  Made by{" "}
                  <a
                    href="https://www.linkedin.com/in/usman-g/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-neutral-700 transition-colors"
                  >
                    Usman Ghani
                  </a>{" "}
                  with ☕️
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#3d3d3a] mb-4">Connect</h4>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li>
                    <a
                      href="https://github.com/nexarvo/llm_lab"
                      className="hover:text-neutral-900 transition-colors"
                    >
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:usmanghani564.ug9@gmail.com"
                      className="hover:text-neutral-900 transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-500">
              <p>© {new Date().getFullYear()} LLM Lab. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
