const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const resourceService = require("../services/resourceService");

const listResources = asyncHandler(async (req, res) => {
  const items = await resourceService.listResources(req.query || {});
  res.json({ ok: true, items });
});

const getResource = asyncHandler(async (req, res) => {
  const item = await resourceService.getResource(Number(req.params.id));

  if (!item) {
    return res.status(404).json({ ok: false, error: "Resource not found" });
  }

  res.json({ ok: true, item });
});

const createResource = asyncHandler(async (req, res) => {
  const item = await resourceService.createResource(req.body || {});
  res.status(201).json({ ok: true, item });
});

const updateResource = asyncHandler(async (req, res) => {
  const item = await resourceService.updateResource(Number(req.params.id), req.body || {});
  res.json({ ok: true, item });
});

const deleteResource = asyncHandler(async (req, res) => {
  await resourceService.deleteResource(Number(req.params.id));
  res.status(204).send();
});

const getMenuResources = asyncHandler(async (req, res) => {
  const { platform, category } = req.params;
  const items = await resourceService.listVisibleResourcesByPlatformAndCategory(platform, category);

  if (!items) {
    throw new HttpError(404, "Platform or category not found");
  }

  res.json({ ok: true, items });
});

const getPublicResource = asyncHandler(async (req, res) => {
  const { platform, slug } = req.params;
  const item = await resourceService.getVisibleResourceByPlatformAndSlug(platform, slug);

  if (!item) {
    throw new HttpError(404, "Resource not found");
  }

  res.json({
    ok: true,
    item: {
      id: item.id,
      name: item.name,
      slug: item.slug,
      downloadLink: item.downloadLink,
      fixLink: item.fixLink,
      tutorialChannelId: item.tutorialChannelId,
      tutorialMessageId: item.tutorialMessageId,
      displayOrder: item.displayOrder,
      isVisible: item.isVisible,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      platform: item.platform,
      category: item.category,
    },
  });
});

module.exports = {
  listResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  getMenuResources,
  getPublicResource,
};