// src/services/apiService.ts
import axios from 'axios';

// The base URL from your senior
const API_BASE_URL = 'https://585b8dabdc5f.ngrok-free.app';

// --- TypeScript interfaces ---
export interface StackOption {
  label: string;
  value: string;
}

export interface AllStackOptions {
  backend: StackOption[];
  frontend: StackOption[];
  module: StackOption[];
}

export interface GenerationPayload {
  project_name: string;
  backend: string;
  frontend: string;
  modules: string[];
}

// --- API FUNCTION 1: Get dropdown options ---
export const getStackOptions = async (): Promise<AllStackOptions> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/generate-boilerplate/stack-dropdown`,
      { headers: { 'ngrok-skip-browser-warning': 'true' } }
    );

    // ✅ Fix: return the 'data' property inside the API response
    return response.data.data;
  } catch (error) {
    console.error("API Error fetching stack options:", error);
    throw new Error("Could not load project options from the server.");
  }
};

// --- API FUNCTION 2: Generate and download project ---
export const generateProject = async (payload: GenerationPayload) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/generate-boilerplate`,
      payload,
      {
        headers: { 'ngrok-skip-browser-warning': 'true' },
        responseType: 'blob',
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${payload.project_name}.zip`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("API Error generating project:", error);
    throw new Error("Network issue or server error. Please try again.");
  }
};
