const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/userService");

const listUsers = asyncHandler(async (req, res) => {
  const items = await userService.listUsers();
  res.json({ ok: true, items });
});

const getUser = asyncHandler(async (req, res) => {
  const item = await userService.getUser(Number(req.params.id));

  if (!item) {
    return res.status(404).json({ ok: false, error: "User not found" });
  }

  res.json({ ok: true, item });
});

const createUser = asyncHandler(async (req, res) => {
  const item = await userService.createUser(req.body || {});
  res.status(201).json({ ok: true, item });
});

const updateUser = asyncHandler(async (req, res) => {
  const item = await userService.updateUser(Number(req.params.id), req.body || {});
  res.json({ ok: true, item });
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(Number(req.params.id));
  res.status(204).send();
});

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};