const express = require("express");
const platformController = require("../controllers/platformController");

const router = express.Router();

router.get("/", platformController.listPlatforms);
router.post("/", platformController.createPlatform);
router.get("/:id", platformController.getPlatform);
router.patch("/:id", platformController.updatePlatform);
router.delete("/:id", platformController.deletePlatform);

module.exports = router;