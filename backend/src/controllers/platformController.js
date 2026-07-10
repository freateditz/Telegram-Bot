const asyncHandler = require("../utils/asyncHandler");
const platformService = require("../services/platformService");

const listPlatforms = asyncHandler(async (req, res) => {
  const items = await platformService.listPlatforms();
  res.json({ ok: true, items });
});

const getPlatform = asyncHandler(async (req, res) => {
  const item = await platformService.getPlatform(Number(req.params.id));

  if (!item) {
    return res.status(404).json({ ok: false, error: "Platform not found" });
  }

  res.json({ ok: true, item });
});

const createPlatform = asyncHandler(async (req, res) => {
  const item = await platformService.createPlatform(req.body || {});
  res.status(201).json({ ok: true, item });
});

const updatePlatform = asyncHandler(async (req, res) => {
  const item = await platformService.updatePlatform(Number(req.params.id), req.body || {});
  res.json({ ok: true, item });
});

const deletePlatform = asyncHandler(async (req, res) => {
  await platformService.deletePlatform(Number(req.params.id));
  res.status(204).send();
});

module.exports = {
  listPlatforms,
  getPlatform,
  createPlatform,
  updatePlatform,
  deletePlatform,
};