/**
 * Strongly-typed access to Vite environment variables.
 * Use this everywhere instead of `import.meta.env` so missing keys
 * fail loud during development rather than silently at runtime.
 */
interface AppEnv {
  apiBaseUrl: string;
  appName: string;
}

function readEnv(): AppEnv {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const appName = import.meta.env.VITE_APP_NAME;

  if (!apiBaseUrl) {
    throw new Error(
      "VITE_API_BASE_URL is not defined. Check the dashboard .env file."
    );
  }
  if (!appName) {
    throw new Error(
      "VITE_APP_NAME is not defined. Check the dashboard .env file."
    );
  }

  return { apiBaseUrl, appName };
}

export const env: AppEnv = readEnv();
