/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useChatStore } from "../store/chatStore";
import { LLMResult } from "@/types/llm";
import { ExperimentStatus } from "./ExperimentStatus";

export default function ResponseBars({
  data,
  prompt,
  isExperimentDetailScreen = false,
}: {
  data?: LLMResult[];
  prompt?: string;
  isExperimentDetailScreen: boolean;
}) {
  const storeResults = useChatStore((s) => s.llmResults);
  const isLoading = useChatStore((s) => s.isLoading);
  const currentExperimentId = useChatStore((s) => s.currentExperimentId);
  const originalPrompt = useChatStore((s) => s.originalPrompt);

  // Ensure items is always an array, preferring props then store
  const items: any[] = useMemo(
    () =>
      Array.isArray(data)
        ? data
        : Array.isArray(storeResults)
        ? storeResults
        : [],
    [data, storeResults]
  );

  console.log("items: ", items);

  // stable ids (stringified indices)
  const ids = useMemo(() => items.map((_, i) => String(i)), [items]);

  // initial selection: first up to 3 ids
  const initial = useMemo(() => ids.slice(0, 3), [ids]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initial);

  // normalize selection if data changes
  useEffect(() => {
    setSelectedIds((prev) => {
      const maxSlots = 3;
      const available = [...ids];
      const newSel: string[] = [];

      // keep existing selections that still exist and fill up to 3
      for (const id of prev) {
        if (newSel.length >= maxSlots) break;
        if (available.includes(id) && !newSel.includes(id)) newSel.push(id);
      }
      for (const id of available) {
        if (newSel.length >= maxSlots) break;
        if (!newSel.includes(id)) newSel.push(id);
      }
      return newSel;
    });
  }, [ids]);

  function optionsForSlot(slotIndex: number) {
    const otherSelected = selectedIds.filter((_, i) => i !== slotIndex);
    return ids.filter((id) => !otherSelected.includes(id));
  }

  function handleSelectChange(slotIndex: number, newId: string) {
    setSelectedIds((prev) => {
      const copy = [...prev];
      copy[slotIndex] = newId;
      return copy;
    });
  }

  const slots =
    items.length > 3 ? [0, 1, 2] : items.length === 2 ? [0, 1] : [0];

  // Loading and empty states
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <ExperimentStatus experimentId={currentExperimentId} />
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>No responses yet. Generate some responses to see them here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="px-8 mb-4 text-xl font-semibold">Response comparison</h3>
      {(isExperimentDetailScreen ? prompt : originalPrompt) && (
        <div className="flex justify-end mb-10">
          <div className="px-8 self-end bg-neutral-300/30 py-6 w-xl rounded-lg">
            <span className="text-sm">
              {isExperimentDetailScreen ? prompt : originalPrompt}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start justify-between w-full">
          {slots.map((slotIndex) => {
            const available = optionsForSlot(slotIndex);
            const selectedId = selectedIds[slotIndex] ?? "";
            const showCard = selectedId !== "" && ids.includes(selectedId);
            const item = showCard ? items[Number(selectedId)] : null;

            return (
              <div
                key={slotIndex}
                className="w-full min-h-[160px] p-4 bg-background dark:bg-slate-800 border-r border-dashed border-secondary last:border-r-0"
              >
                {/* Select */}
                <div className="mb-3">
                  <Select
                    value={selectedId}
                    onValueChange={(val: string | string[]) =>
                      handleSelectChange(
                        slotIndex,
                        Array.isArray(val) ? String(val[0]) : String(val)
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          showCard
                            ? `${item?.model} — ${item?.provider} [temp: ${item?.temperature}, top_p: ${item?.top_p}]`
                            : "Select response"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {available.map((id) => {
                        const opt = items[Number(id)];
                        return (
                          <SelectItem key={id} value={id}>
                            {opt.model} — {opt.provider}{" "}
                            {items.length > 3
                              ? `[temp:
                            ${item?.temperature}, top_p: ${item?.top_p}]`
                              : null}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col h-96">
                  {item ? (
                    <>
                      <div className="flex justify-between">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">
                              {item.model}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.provider}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col text-xs text-muted-foreground">
                          <Badge
                            key="temperature"
                            variant="secondary"
                            className="h-5 bg-amber-100/50 border border-amber-200 text-amber-800/70 hover:text-amber-900/70 font-medium max-w-[12rem] truncate min-w-0"
                          >
                            temperature: {item.temperature}
                          </Badge>
                          <Badge
                            key="top_p"
                            variant="secondary"
                            className="h-5 mt-1 bg-lime-100/50 border border-lime-200 text-lime-800/70 hover:text-lime-900/70 font-medium max-w-[12rem] truncate min-w-0"
                          >
                            top_p: {item.top_p}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-3 flex-1 text-sm text-slate-700 dark:text-slate-200 overflow-auto">
                        {item.response || item["response_text"] ? (
                          <p className="whitespace-pre-wrap break-words">
                            {item.response || item["response_text"]}
                          </p>
                        ) : (
                          <p className="italic text-muted-foreground">
                            No response
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <div>tokens: {item.tokens_used ?? "—"}</div>
                        <div className="italic">
                          {item.execution_time.toFixed(1)}s
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No response selected
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
