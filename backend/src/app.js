const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const env = require("./config/env");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

/**
 * Build the Express app.
 *
 * Architecture:
 *   1. `trust proxy` — Railway sits behind a load balancer that sets
 *      `X-Forwarded-*` headers. We need this so `req.ip`, rate
 *      limiters, and any future signed-cookie logic work correctly.
 *   2. CORS — the only path that matters for browser access. Must run
 *      first so OPTIONS preflights are answered before any other
 *      middleware touches the request.
 *   3. JSON / urlencoded body parsers.
 *   4. `/api` mount point — the single source of truth for the API
 *      prefix. Matches the frontend's `VITE_API_BASE_URL` shape
 *      (`/api` in dev, `https://<railway>/api` in prod).
 *   5. 404 + error handlers last.
 */
function createApp() {
  const app = express();

  // Trust the first proxy hop. Railway's edge LB is the only thing in
  // front of us, so `1` is correct. (Unbounded `true` would let
  // attackers spoof `X-Forwarded-For` if the app ever logs IPs.)
  app.set("trust proxy", 1);

  // CORS — exact-match allowlist plus the Vercel preview pattern and
  // localhost. We do NOT use the `*` wildcard because the browser
  // rejects it together with `credentials: true`.
  app.use(
    cors({
      origin: (origin, callback) => {
        if (env.isOriginAllowed(origin, env.corsOrigins)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposedHeaders: ["Content-Length"],
      maxAge: 86400,
    })
  );

  // Explicit catch-all for OPTIONS. The cors middleware already
  // handles this, but the explicit route is a belt-and-suspenders
  // guarantee that preflights never fall through to a 404.
  app.options(/.*/, cors());

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Single mount point for every API endpoint.
  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
