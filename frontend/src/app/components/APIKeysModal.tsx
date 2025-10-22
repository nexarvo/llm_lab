"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Key, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAPIKeysStore } from "../store/apiKeysStore";
import { useSupportedProviders } from "../hooks/useLLM";

interface APIKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredProviders: string[];
  onComplete: () => void;
}

type ProviderInfo = {
  id: string;
  name?: string;
  display_name?: string;
  provider?: string;
  description?: string;
};

export function APIKeysModal({
  isOpen,
  onClose,
  requiredProviders,
  onComplete,
}: APIKeysModalProps) {
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addApiKey } = useAPIKeysStore();

  const { data: providersData, error: providersError } =
    useSupportedProviders();

  // Fetch from either .providers, .models, or whatever field is array of objects in providersData
  const providersArray: ProviderInfo[] = Array.isArray(providersData?.providers)
    ? providersData.providers
    : Array.isArray(providersData?.models)
    ? providersData.models
    : [];

  // Improved lookup: prefer .provider match, then fallback to .id/.name
  const getProviderInfo = (provider: string): ProviderInfo | undefined => {
    // Prefer strict provider match (e.g., provider: "openrouter")
    let info = providersArray.find(
      (item) =>
        item.provider && item.provider.toLowerCase() === provider.toLowerCase()
    );
    if (info) return info;
    // Try via id match (if provider is e.g. "openai/gpt-oss-20b:free")
    info = providersArray.find(
      (item) =>
        typeof item.id === "string" &&
        item.id.toLowerCase() === provider.toLowerCase()
    );
    if (info) return info;
    // Try via name match (case-insensitive, loose)
    info = providersArray.find(
      (item) =>
        typeof item.name === "string" &&
        item.name.toLowerCase().includes(provider.toLowerCase())
    );
    return info;
  };

  const currentProvider = requiredProviders[currentProviderIndex];
  const isLastProvider = currentProviderIndex === requiredProviders.length - 1;

  useEffect(() => {
    if (isOpen) {
      setCurrentProviderIndex(0);
      setApiKey("");
      setError(null);
    }
  }, [isOpen]);

  const handleNext = async () => {
    if (!apiKey.trim()) {
      setError("Please enter an API key");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add the API key to the store
      addApiKey({
        provider: currentProvider,
        key: apiKey.trim(),
        name: getProviderDisplayName(currentProvider),
      });

      if (isLastProvider) {
        // All providers have been configured
        onComplete();
        onClose();
      } else {
        // Move to next provider
        setCurrentProviderIndex(currentProviderIndex + 1);
        setApiKey("");
      }
    } catch {
      setError("Failed to save API key. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fix: Only show "OpenRouter" if provider === "openrouter" and not just because .provider field exists
  const getProviderDisplayName = (provider: string) => {
    // Use the canonical display name for well-known providers
    const canonical: Record<string, string> = {
      openai: "OpenAI",
      anthropic: "Anthropic",
      google: "Google",
      openrouter: "OpenRouter",
    };
    // If an exact match to canonical, use the canonical
    if (canonical[provider]) {
      return canonical[provider];
    }
    // Otherwise, use info from providers array
    const providerInfo = getProviderInfo(provider);
    if (providerInfo) {
      return (
        providerInfo.display_name ||
        providerInfo.name ||
        providerInfo.provider ||
        provider
      );
    }
    // fallback to provider string itself
    return provider;
  };

  if (!currentProvider) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Required
          </DialogTitle>
          <DialogDescription>
            {providersError && (
              <span className="text-red-800">
                Error loading provider information: {providersError.message}
              </span>
            )}
            {!providersError && (
              <span>
                {getProviderDisplayName(currentProvider)}
                {(() => {
                  // Optionally, show provider info or example
                  const info = getProviderInfo(currentProvider);
                  if (info?.description) {
                    return (
                      <>
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {info.description}
                        </span>
                      </>
                    );
                  }
                  return null;
                })()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {currentProviderIndex + 1} of {requiredProviders.length}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {getProviderDisplayName(currentProvider)}
            </span>
          </div>

          {/* API Key input */}
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setApiKey(e.target.value)
                }
                placeholder={`Enter your ${getProviderDisplayName(
                  currentProvider
                )} API key`}
                className="pr-10"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info about API keys */}
          <Alert className="bg-green-100/50">
            <AlertCircle className="h-4 w-4 text-green-900/90" />
            <AlertDescription className="text-green-900/90">
              Your API keys are stored locally and encrypted. We never store
              them on server.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? "Saving..." : isLastProvider ? "Complete" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
