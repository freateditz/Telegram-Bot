const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channelController");

router.get("/", channelController.listChannels);
router.get("/:id", channelController.getChannel);
router.post("/", channelController.createChannel);
router.patch("/:id", channelController.updateChannel);
router.put("/:id", channelController.updateChannel);
router.delete("/:id", channelController.deleteChannel);

module.exports = router;
