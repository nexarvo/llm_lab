"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
  Settings2,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "./ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useLLMGeneration, useSupportedProviders } from "../hooks/useLLM";
import { useChatStore } from "../store/chatStore";
import { LLMRequest, LLMResult } from "@/types/llm";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      // Temporarily shrink to get the right scrollHeight
      textarea.style.height = `${minHeight}px`;

      // Calculate new height
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    // Set initial height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  // Adjust height on window resize
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

export function ChatBox({
  onResults,
  className,
}: {
  onResults?: (results: LLMResult[], experimentId?: string) => void;
  className?: string;
}) {
  const [input, setInput] = useState("");

  // LLM hooks
  const { mutateAsync: generateLLM, isPending, error } = useLLMGeneration();
  const { data: providersData, error: providersError } =
    useSupportedProviders();

  const setIsLoading = useChatStore((s) => s.setIsLoading);
  const setIsTransitioning = useChatStore((s) => s.setIsTransitioning);
  const setCurrentExperimentId = useChatStore((s) => s.setCurrentExperimentId);
  const setResults = useChatStore((s) => s.setResults);

  const firstTimeSend = useChatStore((s) => s.firstTimeSend);

  const handleSend = async () => {
    console.log("selectedModels.length: ", selectedModels.length);
    if (selectedModels.length === 0) return;

    // Prepare the LLM request
    const request: LLMRequest = {
      prompt: input,
      temperatures: multiModel ? [singleTemp] : tempRange,
      top_ps: multiModel ? [singleTopP] : topPRange,
      single_llm: !multiModel,
      models: selectedModels,
      mock_mode: selectedModels[0] === "Mock LLM (Testing)", // Use mock mode for testing
    };

    if (firstTimeSend) setIsTransitioning(true);

    setIsLoading(true);

    try {
      const response = await generateLLM(request);

      console.log("LLM Response (await):", response);

      if (response) {
        setResults(response.results);
        setCurrentExperimentId(
          response.experiment_id ? String(response.experiment_id) : ""
        );
      }

      // clear loading & inputs
      setIsLoading(false);
      setInput("");
      setValue("");
      adjustHeight(true);
    } catch (err) {
      console.error("LLM Generation Error (await):", err);
      setIsLoading(false);
    }
  };

  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const [tempRange, setTempRange] = useState<[number, number]>([0.1, 0.5]);
  const [topPRange, setTopPRange] = useState<[number, number]>([0.8, 1.0]);

  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  const [multiModel, setMultiModel] = useState(false);
  const [singleTemp, setSingleTemp] = useState(0.5);
  const [singleTopP, setSingleTopP] = useState(0.9);

  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  // When a slider value changes, update the corresponding chip
  useEffect(() => {
    if (!multiModel) {
      setSelectedChips([
        `temp - ${tempRange[0].toFixed(1)}:${tempRange[1].toFixed(1)}`,
        `top_p - ${topPRange[0].toFixed(1)}:${topPRange[1].toFixed(1)}`,
      ]);
    } else {
      setSelectedChips([
        `temp - ${singleTemp.toFixed(1)}`,
        `top_p - ${singleTopP.toFixed(1)}`,
      ]);
    }
  }, [tempRange, topPRange, multiModel, singleTemp, singleTopP]);

  // Use models from API or fallback to hardcoded list
  const models = providersData?.models || [
    // Fallback models
    {
      id: "mock-model",
      name: "Mock LLM (Testing)",
      provider: "mock",
      description:
        "Mock LLM for testing parameter variations without API calls",
    },
  ];

  // Normalization function: always returns array for display, but stores as string in single-select mode
  function normalizeSelectedModels(
    val: string[] | string | undefined | null
  ): string[] {
    if (Array.isArray(val)) return val;
    if (typeof val === "string" && val) return [val];
    return [];
  }
  const normalizedSelectedModels = normalizeSelectedModels(selectedModels);

  return (
    <div
      className={cn(
        "flex flex-col items-center w-full max-w-4xl mx-auto px-4",
        className
      )}
    >
      {firstTimeSend ? (
        <h1 className="text-4xl font-bold text-black dark:text-white">
          What do you want to compare today?
        </h1>
      ) : null}

      {/* Error Messages */}
      {error && (
        <div className="w-full mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">
            Error generating response: {error.message}
          </p>
        </div>
      )}

      {providersError && (
        <div className="w-full mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">
            Error loading models: {providersError.message}
          </p>
        </div>
      )}

      <div className="w-full">
        <div className="relative bg-white rounded-xl border border-neutral-300">
          <div className="overflow-y-auto">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setInput(e.target.value);
                setValue(e.target.value);
                adjustHeight();
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Jot down you thoughts..."
              className={cn(
                "w-full px-4 py-3",
                "resize-none",
                "bg-transparent",
                "border-none",
                "text-black text-sm",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-neutral-500 placeholder:text-sm",
                "min-h-[60px]"
              )}
              style={{
                overflow: "hidden",
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {/* Tools button + Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1 bg-white h-8 w-8"
                    >
                      <Settings2 className="w-2 h-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Multi-Model</label>
                      <Switch
                        checked={multiModel}
                        onCheckedChange={(checked) => setMultiModel(checked)}
                      />
                    </div>
                    <Separator className="my-2" />
                    {!multiModel ? (
                      <>
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            temperature
                          </label>
                          <Slider
                            value={tempRange}
                            onValueChange={(val) =>
                              setTempRange(val as [number, number])
                            }
                            min={0}
                            max={2}
                            step={0.1}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            top_p
                          </label>
                          <Slider
                            value={topPRange}
                            onValueChange={(val) =>
                              setTopPRange(val as [number, number])
                            }
                            min={0}
                            max={1}
                            step={0.05}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            temperature
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min={0}
                            max={2}
                            value={singleTemp}
                            onChange={(e) =>
                              setSingleTemp(
                                Math.min(2, Math.max(0, Number(e.target.value)))
                              )
                            }
                            className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            top_p
                          </label>
                          <input
                            type="number"
                            step="0.05"
                            min={0}
                            max={1}
                            value={singleTopP}
                            onChange={(e) =>
                              setSingleTopP(
                                Math.min(1, Math.max(0, Number(e.target.value)))
                              )
                            }
                            className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                          />
                        </div>
                      </>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {multiModel ? (
                // Multi-select (Popover)
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1 h-7 bg-white text-grey-700 text-sm"
                    >
                      {selectedModels.length > 0
                        ? `${selectedModels.length} selected`
                        : "Select models"}
                      <ChevronDownIcon className="w-4 h-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-3 space-y-2">
                    {models.map((m) => {
                      const isSelected = selectedModels.includes(m.name);
                      return (
                        <div
                          key={m.name}
                          onClick={() =>
                            setSelectedModels((prev) =>
                              isSelected
                                ? prev.filter((x) => x !== m.name)
                                : [...prev, m.name]
                            )
                          }
                          className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer hover:bg-muted ${
                            isSelected ? "bg-accent/30" : ""
                          }`}
                        >
                          <span>{m.name}</span>
                          {isSelected && (
                            <CheckIcon className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      );
                    })}
                  </PopoverContent>
                </Popover>
              ) : (
                // Single-select (Shadcn Select)
                <Select
                  value={selectedModels[0] ?? ""}
                  onValueChange={(val) =>
                    setSelectedModels([
                      typeof val === "string" ? val : val[0] ?? "",
                    ])
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.name} value={m.name}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <button
                type="button"
                onClick={handleSend}
                disabled={
                  !value.trim() || selectedModels.length === 0 || isPending
                }
                className={cn(
                  "px-1.5 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between gap-1",
                  value.trim() && selectedModels.length > 0 && !isPending
                    ? "bg-secondary text-white hover:bg-secondary/80"
                    : "bg-secondary/50 text-white/50 cursor-not-allowed"
                )}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpIcon className="w-4 h-4" />
                )}
                <span className="sr-only">
                  {isPending ? "Generating..." : "Send"}
                </span>
              </button>
            </div>
          </div>

          {!selectedModels ? (
            <div>
              <Separator className="my-2 mx-3" />
              <div className="flex flex-wrap items-start gap-2 w-full min-h-[32px] px-3 py-2">
                {/* Chips area: model chips + parameter chips flow together and wrap naturally */}
                <div className="flex flex-wrap items-start gap-2 w-full min-h-[32px]">
                  {/* model chips (inline) */}
                  <TooltipProvider>
                    {normalizedSelectedModels.map((modelName) => (
                      <Tooltip key={modelName}>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className={
                              "bg-green-100/50 border border-green-200 text-green-800/70 hover:text-green-900/70 font-medium cursor-default " +
                              "max-w-[10rem] truncate min-w-0"
                            }
                            title={modelName}
                          >
                            {modelName.length > 16
                              ? modelName.slice(0, 16) + "…"
                              : modelName}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="text-sm px-3 py-1.5 max-w-xs"
                        >
                          <p>{modelName}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>

                  {/* parameter chips — remain inline and will wrap right after the last model chip */}
                  <div className="flex gap-2 items-center min-w-0">
                    {selectedChips.map((chip) => (
                      <Badge
                        key={chip}
                        variant="secondary"
                        className="bg-blue-100/50 border border-blue-200 text-blue-800/70 hover:text-blue-900/70 font-medium max-w-[12rem] truncate min-w-0"
                      >
                        {chip}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
