/**
 * Strongly-typed access to Vite environment variables.
 *
 * `VITE_API_BASE_URL` must always end with `/api` because the
 * frontend composes paths like `${apiBaseUrl}/resources`. Both of
 * the following shapes are valid:
 *
 *   - Local (Vite proxy):   "/api"
 *   - Production (absolute): "https://<backend-host>/api"
 *
 * Use this everywhere instead of `import.meta.env` so missing keys
 * fail loud during development rather than silently at runtime.
 */

interface AppEnv {
  apiBaseUrl: string;
  appName: string;
}

function normalizeBaseUrl(raw: string | undefined): string {
  if (!raw) {
    throw new Error(
      "VITE_API_BASE_URL is not defined. Check the dashboard .env file " +
        "or your Vercel project environment variables."
    );
  }
  // Strip any trailing slashes so `${apiBaseUrl}/resources` always
  // produces `/api/resources` — never `//resources`.
  return raw.replace(/\/+$/, "");
}

function readEnv(): AppEnv {
  const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
  const appName = import.meta.env.VITE_APP_NAME;

  if (!appName) {
    throw new Error(
      "VITE_APP_NAME is not defined. Check the dashboard .env file " +
        "or your Vercel project environment variables."
    );
  }

  return { apiBaseUrl, appName };
}

export const env: AppEnv = readEnv();
