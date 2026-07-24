const express = require("express");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

router.get("/health", analyticsController.health);
router.post("/track", analyticsController.track);
router.get("/overview", analyticsController.getOverview);
router.get("/daily", analyticsController.getDaily);
router.get("/projects", analyticsController.getProjects);
router.get("/projects/:projectId", analyticsController.getProjectAnalytics);
router.get("/resources/top-downloaded", analyticsController.getTopDownloadedResources);
router.get("/resources/:resourceId", analyticsController.getResourceAnalytics);
router.get("/users/activity", analyticsController.getUserActivity);
router.get("/users/top-downloaders", analyticsController.getTopDownloaders);
router.get("/users/search/:telegramId", analyticsController.searchUser);
router.get("/top-projects", analyticsController.getTopProjects);
router.get("/advanced", analyticsController.getAdvancedAnalytics);
router.get("/recent-events", analyticsController.getRecentEvents);

module.exports = router;
