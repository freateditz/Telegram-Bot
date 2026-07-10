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

const router = express.Router();

router.use(healthRoutes);
router.use("/api/platforms", platformRoutes);
router.use("/api/categories", categoryRoutes);
router.use("/api/resources", resourceRoutes);
router.use("/api/menu", menuRoutes);
router.use("/api/resource", publicResourceRoutes);
router.use("/api/verification", verificationRoutes);
router.use("/api/settings", settingRoutes);
router.use("/api/users", userRoutes);

module.exports = router;