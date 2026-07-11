const express = require("express");
const healthRoutes = require("./healthRoutes");
const platformRoutes = require("./platformRoutes");
const categoryRoutes = require("./categoryRoutes");
const resourceRoutes = require("./resourceRoutes");
const menuRoutes = require("./menuRoutes");
const publicResourceRoutes = require("./publicResourceRoutes");
const verificationRoutes = require("./verificationRoutes");
const settingRoutes = require("./settingRoutes");
const userRoutes = require("./userRoutes");

/**
 * Route composition.
 *
 * `app.js` mounts this router at `/api`, so the prefixes below are
 * RELATIVE to `/api`. If you add a new resource, append it here with
 * its `/api`-relative prefix and it will be reachable at `/api/<x>`.
 */
const router = express.Router();

router.use(healthRoutes);
router.use("/platforms", platformRoutes);
router.use("/categories", categoryRoutes);
router.use("/resources", resourceRoutes);
router.use("/menu", menuRoutes);
router.use("/resource", publicResourceRoutes);
router.use("/verification", verificationRoutes);
router.use("/settings", settingRoutes);
router.use("/users", userRoutes);

module.exports = router;
