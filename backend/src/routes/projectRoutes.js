const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

router.get("/", projectController.listProjects);
router.get("/:id", projectController.getProject);
router.get("/slug/:slug", projectController.getProjectBySlug);
router.get("/slug/:slug/delivery", projectController.getProjectDelivery);
router.post("/", projectController.createProject);
router.put("/:id", projectController.updateProject);
router.patch("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);
router.post("/:id/view", projectController.trackView);
router.post("/:id/failed-verification", projectController.trackFailedVerification);
router.post("/:id/download", projectController.trackDownload);

module.exports = router;
