"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  History,
  Key,
  ChevronDown,
  ArrowLeftFromLine,
  PanelLeft,
  ChevronUp,
  Calendar,
  FileText,
  Home,
  Plus,
} from "lucide-react";
import { useExperiments } from "../hooks/useExperiments";
import { useChatStore } from "../store/chatStore";
import { cn } from "@/lib/utils";

interface SideNavigationProps {
  onExperimentSelect: (experimentId: string) => void;
  onKeysPage: () => void;
}

export function SideNavigation({
  onExperimentSelect,
  onKeysPage,
}: SideNavigationProps) {
  const [experimentsOpen, setExperimentsOpen] = useState(true);
  const { data: experimentsData, isLoading, error } = useExperiments();
  const currentExperimentId = useChatStore((s) => s.currentExperimentId);
  const isNavCollapsed = useChatStore((s) => s.isNavCollapsed ?? true);
  const setIsNavCollapsed = useChatStore((s) => s.setIsNavCollapsed);

  const experiments = experimentsData?.experiments || [];

  // You might want to define a "home" action or page if needed.
  // Here, assuming that experiment list (first/topmost experiment) is 'home'
  const handleHomeClick = () => {
    // Optionally you may want to pass special id or logic to go home/root
    if (experiments.length > 0) {
      onExperimentSelect(experiments[0].id);
    }
  };

  return (
    <nav
      className={cn(
        "fixed z-50 top-0 left-0 h-full bg-background border-r transition-all duration-200",
        isNavCollapsed ? "w-12" : "w-70 bg-stone-100"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Top control: collapse/expand */}
        <div className="flex items-center justify-between px-2 h-16 border-b">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="p-2"
              aria-label={
                isNavCollapsed ? "Expand navigation" : "Collapse navigation"
              }
              onClick={() => setIsNavCollapsed?.(!isNavCollapsed)}
            >
              {isNavCollapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <ArrowLeftFromLine className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Nav body */}
        <div className="flex-1 mt-2 flex flex-col space-y-1 px-1">
          {/* Home (experiments root) */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-full flex items-center justify-center",
              !isNavCollapsed && "justify-start px-3 space-x-3"
            )}
            aria-label="new chat"
            onClick={() => {
              handleHomeClick();
            }}
          >
            <span className="flex items-center justify-center rounded-full bg-secondary h-8 w-8">
              <Plus className="text-white w-6 h-6" />
            </span>
            {!isNavCollapsed && (
              <span className="ml-2 text-secondary">New Chat</span>
            )}
          </Button>

          {/* API Keys Section */}
          <Button
            variant="ghost"
            className={cn(
              "w-full flex items-center justify-center",
              !isNavCollapsed && "justify-start px-3 space-x-3"
            )}
            aria-label="API Keys"
            onClick={onKeysPage}
          >
            <Key className="h-5 w-5" />
            {!isNavCollapsed && <span className="ml-2">API Keys</span>}
          </Button>

          <Separator className={cn("my-2", isNavCollapsed && "mx-auto w-8")} />

          {/* Experiments Section */}
          {!isNavCollapsed ? (
            <div className="h-[60%]">
              <Collapsible
                open={experimentsOpen}
                onOpenChange={setExperimentsOpen}
                className="h-full flex flex-col"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-3"
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Experiments
                      {experiments.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {experiments.length}
                        </Badge>
                      )}
                    </div>
                    {experimentsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ArrowLeftFromLine className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                    {experiments.map((experiment) => (
                      <Button
                        key={experiment.id}
                        variant={
                          currentExperimentId === experiment.id
                            ? "secondary"
                            : "ghost"
                        }
                        className={cn(
                          "w-full justify-start text-left h-auto p-3",
                          currentExperimentId === experiment.id &&
                            "bg-secondary"
                        )}
                        onClick={() => {
                          onExperimentSelect(experiment.id);
                        }}
                      >
                        <div className="flex flex-col items-start w-full">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium text-sm truncate">
                              {experiment.name}
                            </span>
                            {currentExperimentId === experiment.id && (
                              <Badge variant="outline" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(
                              experiment.created_at
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
