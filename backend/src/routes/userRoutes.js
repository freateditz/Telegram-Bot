const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", userController.listUsers);
router.post("/", userController.createUser);
router.get("/telegram/:telegramId", userController.getUserByTelegramId);
router.get("/:id", userController.getUser);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/pending-project", userController.setPendingProject);
router.post("/clear-pending-project", userController.clearPendingProject);

module.exports = router;