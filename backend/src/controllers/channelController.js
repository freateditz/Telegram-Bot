const asyncHandler = require("../utils/asyncHandler");
const channelService = require("../services/channelService");

const listChannels = asyncHandler(async (req, res) => {
  const items = await channelService.listChannels();
  res.json({ ok: true, items });
});

const getChannel = asyncHandler(async (req, res) => {
  const item = await channelService.getChannel(Number(req.params.id));
  if (!item) {
    return res.status(404).json({ ok: false, error: "Channel not found" });
  }
  res.json({ ok: true, item });
});

const createChannel = asyncHandler(async (req, res) => {
  const item = await channelService.createChannel(req.body || {});
  res.status(201).json({ ok: true, item });
});

const updateChannel = asyncHandler(async (req, res) => {
  const item = await channelService.updateChannel(Number(req.params.id), req.body || {});
  res.json({ ok: true, item });
});

const deleteChannel = asyncHandler(async (req, res) => {
  await channelService.deleteChannel(Number(req.params.id));
  res.status(204).send();
});

module.exports = {
  listChannels,
  getChannel,
  createChannel,
  updateChannel,
  deleteChannel,
};
