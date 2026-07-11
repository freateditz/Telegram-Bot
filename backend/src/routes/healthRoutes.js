const express = require("express");
const healthController = require("../controllers/healthController");

/**
 * Health endpoint, mounted by `app.js` at `/api`. The route inside
 * this file is RELATIVE to that mount, so we declare it as `/health`,
 * which means the full path is `/api/health`.
 */
const router = express.Router();

router.get("/health", healthController.healthCheck);

module.exports = router;
