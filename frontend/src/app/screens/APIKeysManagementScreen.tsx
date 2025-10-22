"use client";

import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Plus, Edit, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAPIKeysStore } from "../store/apiKeysStore";
import { useSupportedProviders } from "../hooks/useLLM";

interface APIKeysManagementScreenProps {
  onBack: () => void;
}

export default function APIKeysManagementScreen({
  onBack,
}: APIKeysManagementScreenProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");

  const { apiKeys, addApiKey, updateApiKey, removeApiKey } = useAPIKeysStore();
  const { data: providersData } = useSupportedProviders();

  const getProviderDisplayName = (provider: string) => {
    const names: Record<string, string> = {
      openai: "OpenAI",
      anthropic: "Anthropic",
      google: "Google",
      openrouter: "OpenRouter",
    };
    return names[provider] || provider;
  };

  const getAvailableProviders = () => {
    return (
      providersData?.models
        ?.map((m) => {
          if (m.name.includes("OpenRouter") || m.name.includes("openrouter"))
            return "openrouter";
          if (m.name.includes("GPT") || m.name.includes("gpt")) return "openai";
          if (m.name.includes("Claude") || m.name.includes("claude"))
            return "anthropic";
          if (m.name.includes("Gemini") || m.name.includes("gemini"))
            return "google";
          return null;
        })
        .filter(Boolean)
        .filter((provider, index, arr) => arr.indexOf(provider) === index) || []
    );
  };

  const handleAddKey = () => {
    if (!selectedProvider || !newKey.trim()) return;

    addApiKey({
      provider: selectedProvider,
      key: newKey.trim(),
      name: getProviderDisplayName(selectedProvider),
    });

    setNewKey("");
    setSelectedProvider("");
    setIsAdding(false);
  };

  const handleEditKey = (provider: string, newKeyValue: string) => {
    if (!newKeyValue.trim()) return;

    updateApiKey(provider, {
      provider,
      key: newKeyValue.trim(),
      name: getProviderDisplayName(provider),
    });

    setEditingKey(null);
  };

  const handleDeleteKey = (provider: string) => {
    removeApiKey(provider);
  };

  const toggleShowKey = (provider: string) => {
    setShowKey((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return "•".repeat(key.length);
    return (
      key.substring(0, 4) +
      "•".repeat(key.length - 8) +
      key.substring(key.length - 4)
    );
  };

  return (
    <div className="min-h-screen bg-[#faf8f1]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={onBack} variant="outline" size="sm">
            ← Back
          </Button>
          <div>
            <h1 className="text-sm font-bold flex items-center gap-2">
              API Keys
            </h1>
            <p className="text-muted-foreground text-xs">
              Manage your API keys for different LLM providers
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Current API Keys */}
          <div className="space-y-4">
            {apiKeys.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No API keys configured. Add keys to use LLM providers.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.provider}
                    className="mx-20 bg-[#faf8f1] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div className="flex items-center gap-6 flex-1">
                      <div>
                        <div className="font-medium text-sm">{apiKey.name}</div>
                      </div>
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <Input
                          value={
                            showKey[apiKey.provider]
                              ? apiKey.key
                              : maskApiKey(apiKey.key)
                          }
                          readOnly
                          className="font-mono text-sm min-w-0 bg-white"
                          style={{ flex: 1 }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleShowKey(apiKey.provider)}
                          className="bg-blue-100/90 hover:bg-blue-200/90"
                        >
                          {showKey[apiKey.provider] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingKey(apiKey.provider)}
                        className="bg-green-100/90 hover:bg-green-200/90"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteKey(apiKey.provider)}
                        className="bg-red-100/90 hover:bg-red-200/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New API Key */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold"></h2>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Key
              </Button>
            </div>

            {isAdding && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add API Key</CardTitle>
                  <CardDescription>
                    Select a provider and enter your API key
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                      className="w-full rounded-md border border-input bg-[#faf8f1] px-3 py-2 text-sm"
                    >
                      <option value="">Select a provider</option>
                      {getAvailableProviders().map((provider) => (
                        <option key={provider} value={provider || ""}>
                          {getProviderDisplayName(provider || "")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="Enter your API key"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddKey}
                      disabled={!selectedProvider || !newKey.trim()}
                    >
                      Add Key
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAdding(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Edit Key Dialog */}
        <Dialog open={!!editingKey} onOpenChange={() => setEditingKey(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit API Key</DialogTitle>
              <DialogDescription>
                Update your {editingKey && getProviderDisplayName(editingKey)}{" "}
                API key
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="Enter new API key"
                  onChange={(e) => setNewKey(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingKey(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => editingKey && handleEditKey(editingKey, newKey)}
              >
                Update Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
