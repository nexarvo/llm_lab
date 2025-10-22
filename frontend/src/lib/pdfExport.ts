/* eslint-disable @typescript-eslint/no-explicit-any */
import { pdf } from "@react-pdf/renderer";
import React from "react";
import { LLMResult } from "@/types/llm";
import { QualityMetric } from "@/types/metrics";
import { InteractivePDFDocument } from "@/app/components/InteractivePDFDocument";

export interface PDFExportOptions {
  filename?: string;
  quality?: number;
  scale?: number;
}

export const exportToPDF = async (
  llmResults: LLMResult[],
  metrics: QualityMetric[],
  experimentId?: string,
  options: PDFExportOptions = {}
): Promise<void> => {
  const { filename = "experiment-results.pdf" } = options;

  try {
    console.log("Starting PDF generation with:", {
      llmResultsCount: llmResults.length,
      metricsCount: metrics.length,
      experimentId,
    });

    console.log("llmResults: ", llmResults);
    console.log("metrics: ", metrics);

    // Create PDF using react-pdf/renderer
    const pdfDoc = pdf(
      // @ts-expect-error react-pdf expects DocumentProps root, but our component renders one internally
      React.createElement(InteractivePDFDocument, {
        llmResults,
        metrics,
        experimentId,
      })
    );

    console.log("PDF document created, generating blob...");
    const blob = await pdfDoc.toBlob();
    console.log("PDF blob generated successfully, size:", blob.size);

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("PDF download initiated successfully");
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export const exportChatScreenToPDF = async (
  llmResults: LLMResult[],
  metrics: QualityMetric[],
  experimentId?: string
): Promise<void> => {
  const filename = `experiment-results.pdf`;

  await exportToPDF(llmResults, metrics, experimentId, {
    filename,
  });
};
