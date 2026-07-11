require("dotenv").config();

/**
 * CORS allowlist resolution.
 *
 * Goal: production should "just work" on a fresh Railway deploy with
 * ZERO environment variables. So the default allowlist includes the
 * Vercel production domain (the one shipped in `dashboard/.env`) plus
 * the standard Vercel preview pattern.
 *
 * Resolution order (later lists EXTEND earlier ones — they are merged,
 * not replaced, so the defaults are always available):
 *   1. `CORS_ORIGINS` — comma-separated explicit list
 *   2. `FRONTEND_URL` — single origin (Vercel project env var)
 *
 * If neither is set, the production defaults below are used. Local
 * dev origins are always included.
 */
const VERCEL_PREVIEW_REGEX = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

const PRODUCTION_DEFAULTS = [
  // The exact Vercel production URL the dashboard is shipped against.
  "https://telegram-bot-22xi.vercel.app",
  // The Railway backend's own origin (harmless, sometimes useful).
  "https://telegram-bot-production-0b25.up.railway.app",
];

const LOCAL_DEFAULTS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function parseList(raw) {
  return (raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildCorsOrigins() {
  const explicit = parseList(process.env.CORS_ORIGINS);
  const frontendUrl = (process.env.FRONTEND_URL || "").trim();

  const fromEnv = [...explicit];
  if (frontendUrl) {
    fromEnv.push(frontendUrl);
  }

  // De-dupe while preserving order. Env-supplied origins come first
  // (operator intent wins), then production defaults, then local.
  const seen = new Set();
  const merged = [];
  for (const origin of [...fromEnv, ...PRODUCTION_DEFAULTS, ...LOCAL_DEFAULTS]) {
    if (!seen.has(origin)) {
      seen.add(origin);
      merged.push(origin);
    }
  }
  return merged;
}

/**
 * Test whether a request `Origin` header is allowed.
 *
 * Accepts:
 *   - exact matches in `corsOrigins`
 *   - any `https://<sub>.vercel.app` (Vercel production + previews)
 *   - any `http://localhost:<port>` and `http://127.0.0.1:<port>` (dev)
 */
function isOriginAllowed(origin, allowedList) {
  if (!origin) return true; // same-origin, curl, server-to-server
  if (allowedList.includes(origin)) return true;
  if (VERCEL_PREVIEW_REGEX.test(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.BACKEND_PORT || process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL || "file:./backend/prisma/dev.db",
  botToken: process.env.BOT_TOKEN || "",
  telegramChannel: process.env.CHANNEL || "",
  youtubeUrl: process.env.YOUTUBE || "",
  channelLink: process.env.CHANNEL_LINK || "",

  corsOrigins: buildCorsOrigins(),
  frontendUrl: process.env.FRONTEND_URL || "",

  // Exported for use by the CORS middleware's dynamic origin callback.
  isOriginAllowed,
};
