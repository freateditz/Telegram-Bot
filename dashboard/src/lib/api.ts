import axios, { type AxiosError, type AxiosInstance } from "axios";
import { env } from "@/config/env";

/**
 * Single shared Axios instance for the dashboard.
 *
 * Source of truth for the API base URL is `env.apiBaseUrl`, which is
 * derived from `import.meta.env.VITE_API_BASE_URL`. Vite injects
 * that variable from one of (in priority order):
 *
 *   1. Vercel project env vars (Production / Preview)  — runtime override
 *   2. dashboard/.env.production                      — production build
 *   3. dashboard/.env                                 — local dev (vite dev)
 *
 * The value must always end with `/api`. Service-level paths in
 * `apiRoutes.ts` are relative to that prefix (e.g. "/resources"), so
 * the same code composes correctly in every environment:
 *
 *   - Local:  baseURL="/api"  + "/resources"  -> /api/resources
 *             (Vite dev proxy forwards to backend on :3000)
 *   - Prod:   baseURL="https://<railway>/api" + "/resources"
 *             -> https://<railway>/api/resources
 *
 * JSON content type is set up front so services don't repeat it.
 * The response interceptor normalizes errors to plain `Error`
 * objects so React Query / components can render `error.message`
 * directly.
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
