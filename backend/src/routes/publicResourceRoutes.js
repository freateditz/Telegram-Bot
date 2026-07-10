const express = require("express");
const resourceController = require("../controllers/resourceController");

const router = express.Router();

router.get("/:platform/:slug", resourceController.getPublicResource);

module.exports = router;