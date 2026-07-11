import axios, { type AxiosError, type AxiosInstance } from "axios";
import { env } from "@/config/env";

/**
 * Single shared Axios instance for the dashboard.
 * - Base URL is set from VITE_API_BASE_URL (proxied in dev, absolute in prod).
 * - JSON content type is set up front so services don't repeat it.
 * - Response interceptor normalizes errors to plain `Error` objects so
 *   React Query / components can render `error.message` directly.
 */
export const api: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const serverMessage =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message;

    return Promise.reject(
      new Error(serverMessage || "Unexpected API error")
    );
  }
);
