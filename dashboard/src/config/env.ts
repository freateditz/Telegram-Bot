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
 * Vite automatically loads:
 *   - `.env`             — every mode
 *   - `.env.development` — `vite dev`
 *   - `.env.production`  — `vite build`
 *
 * We resolve the URL in this priority:
 *   1. Vercel-injected `VITE_API_BASE_URL` (set in the project's
 *      Environment Variables panel) — wins over files when set.
 *   2. File-loaded value (`.env.production` for prod, `.env` for dev).
 *
 * Use this module everywhere instead of `import.meta.env` so missing
 * keys fail loud during development rather than silently at runtime.
 */

interface AppEnv {
  apiBaseUrl: string;
  appName: string;
}

function normalizeBaseUrl(raw: string | undefined): string {
  if (!raw) {
    throw new Error(
      "VITE_API_BASE_URL is not defined. Set it in dashboard/.env, " +
        "dashboard/.env.production, or the Vercel project environment " +
        "variables."
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
      "VITE_APP_NAME is not defined. Set it in dashboard/.env, " +
        "dashboard/.env.production, or the Vercel project environment " +
        "variables."
    );
  }

  return { apiBaseUrl, appName };
}

export const env: AppEnv = readEnv();
