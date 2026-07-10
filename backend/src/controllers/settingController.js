const asyncHandler = require("../utils/asyncHandler");
const settingService = require("../services/settingService");

const listSettings = asyncHandler(async (req, res) => {
  const items = await settingService.listSettings();
  res.json({ ok: true, items });
});

const getSetting = asyncHandler(async (req, res) => {
  const item = await settingService.getSetting(Number(req.params.id));

  if (!item) {
    return res.status(404).json({ ok: false, error: "Setting not found" });
  }

  res.json({ ok: true, item });
});

const createSetting = asyncHandler(async (req, res) => {
  const item = await settingService.createSetting(req.body || {});
  res.status(201).json({ ok: true, item });
});

const updateSetting = asyncHandler(async (req, res) => {
  const item = await settingService.updateSetting(Number(req.params.id), req.body || {});
  res.json({ ok: true, item });
});

const deleteSetting = asyncHandler(async (req, res) => {
  await settingService.deleteSetting(Number(req.params.id));
  res.status(204).send();
});

module.exports = {
  listSettings,
  getSetting,
  createSetting,
  updateSetting,
  deleteSetting,
};