"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LLMResult } from "@/types/llm";

interface ChatState {
  firstTimeSend: boolean;
  isTransitioning: boolean;
  currentExperimentId: string;
  isLoading: boolean; // LLM generation loading
  llmResults: LLMResult[];
  setFirstTimeSend: (v: boolean) => void;
  setIsTransitioning: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setCurrentExperimentId: (id: string) => void;
  setResults: (results: LLMResult[]) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      firstTimeSend: true,
      isTransitioning: false,
      currentExperimentId: "",
      isLoading: false,
      llmResults: [],
      setFirstTimeSend: (v: boolean) => set({ firstTimeSend: v }),
      setIsTransitioning: (v: boolean) => set({ isTransitioning: v }),
      setCurrentExperimentId: (v: string) => set({ currentExperimentId: v }),
      setIsLoading: (v: boolean) => set({ isLoading: v }),
      setResults: (results: LLMResult[]) => set({ llmResults: results }),
      reset: () =>
        set({
          firstTimeSend: true,
          isTransitioning: false,
          currentExperimentId: "",
          isLoading: false,
          llmResults: [],
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
