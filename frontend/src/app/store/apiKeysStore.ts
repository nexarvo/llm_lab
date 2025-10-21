import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface APIKey {
  provider: string;
  key: string;
  name: string;
}

interface APIKeysState {
  apiKeys: APIKey[];
  addApiKey: (apiKey: APIKey) => void;
  updateApiKey: (provider: string, apiKey: APIKey) => void;
  removeApiKey: (provider: string) => void;
  getApiKey: (provider: string) => APIKey | undefined;
  hasApiKey: (provider: string) => boolean;
  getMissingProviders: (requiredProviders: string[]) => string[];
}

export const useAPIKeysStore = create<APIKeysState>()(
  persist(
    (set, get) => ({
      apiKeys: [],

      addApiKey: (apiKey: APIKey) =>
        set((state) => ({
          apiKeys: [
            ...state.apiKeys.filter((k) => k.provider !== apiKey.provider),
            apiKey,
          ],
        })),

      updateApiKey: (provider: string, apiKey: APIKey) =>
        set((state) => ({
          apiKeys: state.apiKeys.map((k) =>
            k.provider === provider ? apiKey : k
          ),
        })),

      removeApiKey: (provider: string) =>
        set((state) => ({
          apiKeys: state.apiKeys.filter((k) => k.provider !== provider),
        })),

      getApiKey: (provider: string) =>
        get().apiKeys.find((k) => k.provider === provider),

      hasApiKey: (provider: string) =>
        get().apiKeys.some((k) => k.provider === provider),

      getMissingProviders: (requiredProviders: string[]) =>
        requiredProviders.filter((provider) => !get().hasApiKey(provider)),
    }),
    {
      name: "api-keys-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
