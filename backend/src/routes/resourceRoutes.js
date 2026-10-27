const express = require("express");
const resourceController = require("../controllers/resourceController");

const router = express.Router();

router.get("/", resourceController.listResources);
router.post("/", resourceController.createResource);
router.get("/slug/:slug", resourceController.getResourceBySlug);
router.get("/:id", resourceController.getResource);
router.post("/:id/download", resourceController.trackDownload);
router.patch("/:id", resourceController.updateResource);
router.delete("/:id", resourceController.deleteResource);

module.exports = router;