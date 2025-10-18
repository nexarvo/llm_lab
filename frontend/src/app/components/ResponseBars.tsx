"use client";

import React, { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type LLMResult = {
  provider: string;
  model: string;
  temperature: number;
  top_p: number;
  response: string;
  tokens_used?: number | null;
  execution_time: number;
  success: boolean;
  error?: string | null;
};

const MOCK_DATA: LLMResult[] = [
  {
    provider: "openai",
    model: "gpt-5",
    temperature: 0.1,
    top_p: 0.1,
    response:
      "Short answer: start by researching local markets, drafting a business plan, and securing funding. Then iterate quickly and learn from customers.",
    tokens_used: 120,
    execution_time: 12.4,
    success: true,
  },
  {
    provider: "anthropic",
    model: "claude:3.7-sonnet",
    temperature: 0.1,
    top_p: 0.2,
    response:
      "This result is a little longer — you can see a preview here but hovering expands the card to show full content and more detail about strategy, legal steps, and marketing tips for early-stage businesses.",
    tokens_used: 240,
    execution_time: 18.2,
    success: true,
  },
  {
    provider: "ollama",
    model: "phi3:mini",
    temperature: 0.7,
    top_p: 0.1,
    response: "A concise response from phi3:mini.",
    tokens_used: 80,
    execution_time: 10,
    success: true,
  },
  {
    provider: "openai",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    top_p: 0.2,
    response:
      "Done — I moved ResponseBars into a full-width grid row so it uses the entire page width (including the space where the empty aside was). This will eliminate that large blank area on the left and ensure the three comparison cards spread out across the available space. What I changed (brief) •	Replaced the previous inline placement of <ResponseBars /> inside the section with a div that occupies col-span-12 (a full row) and added a top margin mt-8 so it sits below the chat area. Why this fixes the blank-left issue •	Previously the grid reserved 3 columns for the aside (empty), and the 3-card comparison lived inside the section’s 9-column area — that caused the cards to be shifted right. By moving the comparison into a full-width row, the cards can use the full 12-column width and distribute evenly. Next steps / options •	If you want the comparison to appear inline with the chat (same row) but still use the left space, we could conditionally hide the aside when empty ({hasSidebar && <aside>...</aside>}) instead. •	If you’d like the comparison to stay visually connected to the chat but centered, we can instead make the aside collapse using hidden sm:block or change its col-span at different breakpoints.",
    tokens_used: 540,
    execution_time: 25.7,
    success: true,
  },
  {
    provider: "local",
    model: "mymodel:1",
    temperature: 0.2,
    top_p: 0.9,
    response:
      "Another detailed answer — very long content to exercise the vertical scroll inside the card. " +
      "(repeated) ".repeat(20),
    tokens_used: 310,
    execution_time: 18.1,
    success: true,
  },
  {
    provider: "another",
    model: "small:1",
    temperature: 0.3,
    top_p: 0.5,
    response: "Short note from small model.",
    tokens_used: 45,
    execution_time: 8.5,
    success: true,
  },
];

export default function ResponseBars({
  data = MOCK_DATA,
}: {
  data?: LLMResult[];
}) {
  const items = data;

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

  const slots = [0, 1, 2];

  return (
    <div className="w-full">
      <h3 className="px-8 mb-4 text-lg font-semibold">
        Response comparison (pick up to 3)
      </h3>

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
                    onValueChange={(val) => handleSelectChange(slotIndex, val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          showCard
                            ? `${item?.model} — ${item?.provider}`
                            : "Select response"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {available.map((id) => {
                        const opt = items[Number(id)];
                        return (
                          <SelectItem key={id} value={id}>
                            {opt.model} — {opt.provider}
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

                      <div className="mt-3 flex-1 text-sm text-slate-700 dark:text-slate-200 overflow-hidden">
                        {item.response ? (
                          <p className="whitespace-pre-wrap line-clamp-6">
                            {item.response}
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
