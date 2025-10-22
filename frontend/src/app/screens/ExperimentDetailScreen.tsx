"use client";

import React from "react";
import { motion } from "framer-motion";
import ResponseBars from "../components/ResponseBars";
import QualityMetricsChart from "../components/QualityMetricsChart";
import { useExperiment } from "../hooks/useExperiment";
import { useMetrics } from "../hooks/useMetrics";
import { Button } from "../components/ui/button";
import { ArrowLeft, Download, Calendar, FileText } from "lucide-react";
import { exportChatScreenToPDF } from "@/lib/pdfExport";
import { useState } from "react";
import { useChatStore } from "../store/chatStore";

interface ExperimentDetailScreenProps {
  experimentId: string;
  onBack: () => void;
}

export default function ExperimentDetailScreen({
  experimentId,
  onBack,
}: ExperimentDetailScreenProps) {
  const [isExporting, setIsExporting] = useState(false);

  const isLoading = useChatStore((s) => s.isLoading);

  const {
    data: experiment,
    isLoading: experimentLoading,
    error: experimentError,
  } = useExperiment(experimentId);

  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useMetrics(experimentId);

  const handleExportPDF = async () => {
    if (!experiment?.llm_results || experiment.llm_results.length === 0) {
      alert("No results to export. This experiment has no responses.");
      return;
    }

    setIsExporting(true);
    try {
      await exportChatScreenToPDF(
        experiment.llm_results,
        metrics || [],
        experimentId
      );
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (experimentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading experiment...</p>
        </div>
      </div>
    );
  }

  if (experimentError || !experiment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f1]">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading experiment</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f1]">
      {/* Header */}
      <div className="border-b bg-[#faf8f1]/95 backdrop-blur supports-[backdrop-filter]:bg-[#faf8f1]/60">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-sm font-bold">{experiment.name}</h1>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {experiment.created_at !== undefined
                      ? new Date(
                          experiment.created_at * 1000
                        ).toLocaleDateString()
                      : new Date().toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {experiment.llm_results?.length || 0} responses
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={handleExportPDF}
              disabled={
                isLoading ||
                isExporting ||
                !experiment.llm_results ||
                experiment.llm_results.length === 0
              }
              variant="outline"
              size="sm"
              className="flex items-center gap-1 bg-emerald-200/50 text-emerald-800/70 hover:bg-emerald-300/50 hover:text-emerald-900/70"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Response Bars */}
          {experiment.llm_results && experiment.llm_results.length > 0 ? (
            <ResponseBars
              data={experiment.llm_results}
              prompt={experiment.orginal_message}
              isExperimentDetailScreen={true}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No responses found for this experiment.
              </p>
            </div>
          )}

          {/* Quality Metrics */}
          {metrics && metrics.length > 0 && (
            <QualityMetricsChart
              metrics={metrics}
              experimentId={experimentId}
            />
          )}

          {metricsLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Loading quality metrics...
              </p>
            </div>
          )}

          {metricsError && (
            <div className="text-center py-8">
              <p className="text-destructive">Error loading quality metrics</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
