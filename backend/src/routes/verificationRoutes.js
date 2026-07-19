const express = require("express");
const verificationController = require("../controllers/verificationController");

const router = express.Router();

router.get("/prompt", verificationController.getPrompt);
router.get("/status/:userId", verificationController.getStatus);
router.post("/check-member", verificationController.checkMember);
router.post("/mark", verificationController.markVerified);
router.post("/unverify", verificationController.unverify);

module.exports = router;