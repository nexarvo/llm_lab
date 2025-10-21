"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LLMResult } from "@/types/llm";
import { ExperimentStatus } from "@/lib/llm";

interface ChatState {
  firstTimeSend: boolean;
  isTransitioning: boolean;
  currentExperimentId: string;
  isLoading: boolean; // LLM generation loading
  isNavCollapsed: boolean;
  llmResults: LLMResult[];
  originalPrompt: string;
  experimentStatus: string;
  // Experiment polling state
  experimentStatusData: ExperimentStatus | null;
  isPolling: boolean;
  pollingError: string | null;
  setFirstTimeSend: (v: boolean) => void;
  setIsTransitioning: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setCurrentExperimentId: (id: string) => void;
  setOriginalPrompt: (id: string) => void;
  setResults: (results: LLMResult[]) => void;
  setExperimentStatus: (status: string) => void;
  // Experiment polling actions
  setExperimentStatusData: (data: ExperimentStatus | null) => void;
  setIsPolling: (polling: boolean) => void;
  setPollingError: (error: string | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      firstTimeSend: true,
      isTransitioning: false,
      currentExperimentId: "",
      isLoading: false,
      isNavCollapsed: true,
      llmResults: [],
      experimentStatus: "",
      originalPrompt: "",
      // Experiment polling state
      experimentStatusData: null,
      isPolling: false,
      pollingError: null,
      setFirstTimeSend: (v: boolean) => set({ firstTimeSend: v }),
      setIsTransitioning: (v: boolean) => set({ isTransitioning: v }),
      setCurrentExperimentId: (v: string) => set({ currentExperimentId: v }),
      setOriginalPrompt: (v: string) => set({ originalPrompt: v }),
      setIsLoading: (v: boolean) => set({ isLoading: v }),
      setIsNavCollapsed: (v: boolean) => set({ isNavCollapsed: v }),
      setResults: (results: LLMResult[]) => set({ llmResults: results }),
      setExperimentStatus: (v: string) => set({ experimentStatus: v }),
      // Experiment polling actions
      setExperimentStatusData: (data: ExperimentStatus | null) =>
        set({ experimentStatusData: data }),
      setIsPolling: (polling: boolean) => set({ isPolling: polling }),
      setPollingError: (error: string | null) => set({ pollingError: error }),
      reset: () =>
        set({
          firstTimeSend: true,
          isTransitioning: false,
          currentExperimentId: "",
          isLoading: false,
          isNavCollapsed: true,
          llmResults: [],
          experimentStatusData: null,
          isPolling: false,
          pollingError: null,
        }),
    }),
    {
      name: "chat-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist experimentId; others are UI state and can be recomputed
      partialize: (state) => ({ experimentId: state.currentExperimentId }),
    }
  )
);
