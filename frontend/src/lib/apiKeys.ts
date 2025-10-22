import api from "./api";

export interface APIKeyRequest {
  provider: string;
  encrypted_key: string;
}

export interface APIKeyResponse {
  provider: string;
  has_key: boolean;
}

export const storeAPIKey = async (request: APIKeyRequest) => {
  try {
    const response = await api.post("/api-keys/store", request);
    return response.data;
  } catch (error) {
    console.error("Error storing API key:", error);
    throw error;
  }
};

export const checkAPIKey = async (
  provider: string
): Promise<APIKeyResponse> => {
  try {
    const response = await api.get(`/api-keys/check/${provider}`);
    return response.data;
  } catch (error) {
    console.error("Error checking API key:", error);
    throw error;
  }
};

export const deleteAPIKey = async (provider: string) => {
  try {
    const response = await api.delete(`/api-keys/${provider}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting API key:", error);
    throw error;
  }
};
