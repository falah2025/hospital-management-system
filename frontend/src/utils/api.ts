import axios from "axios";
import { useAuthStore } from "../stores/authStore";

// API base URL — configurable via environment variable
// For Capacitor (mobile) builds, point this to your deployed backend URL
// e.g. VITE_API_BASE_URL=https://api.your-domain.com
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally by clearing auth state
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Helper: extract data from { success, data, meta } responses
export const getData = async <T>(promise: Promise<any>): Promise<T> => {
  const { data } = await promise;
  return data.data as T;
};
