const express = require("express");
const settingController = require("../controllers/settingController");

const router = express.Router();

router.get("/", settingController.listSettings);
router.post("/", settingController.createSetting);
router.get("/:id", settingController.getSetting);
router.patch("/:id", settingController.updateSetting);
router.delete("/:id", settingController.deleteSetting);

module.exports = router;