const express = require("express");
const resourceController = require("../controllers/resourceController");

const router = express.Router();

router.get("/:platform/:category", resourceController.getMenuResources);

module.exports = router;