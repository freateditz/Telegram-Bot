const asyncHandler = require("../utils/asyncHandler");
const projectService = require("../services/projectService");

const listProjects = asyncHandler(async (req, res) => {
  const items = await projectService.listProjects();
  res.json({ ok: true, items });
});

const getProject = asyncHandler(async (req, res) => {
  const item = await projectService.getProject(Number(req.params.id));

  if (!item) {
    return res.status(404).json({ ok: false, error: "Project not found" });
  }

  res.json({ ok: true, item });
});

const getProjectBySlug = asyncHandler(async (req, res) => {
  const item = await projectService.getProjectBySlug(req.params.slug);

  if (!item) {
    return res.status(404).json({ ok: false, error: "Project not found" });
  }

  res.json({ ok: true, item });
});

const createProject = asyncHandler(async (req, res) => {
  const item = await projectService.createProject(req.body || {});
  res.status(201).json({ ok: true, item });
});

const updateProject = asyncHandler(async (req, res) => {
  const item = await projectService.updateProject(Number(req.params.id), req.body || {});
  res.json({ ok: true, item });
});

const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(Number(req.params.id));
  res.status(204).send();
});

const trackView = asyncHandler(async (req, res) => {
  await projectService.incrementViewCount(Number(req.params.id));
  res.json({ ok: true });
});

const trackFailedVerification = asyncHandler(async (req, res) => {
  await projectService.incrementFailedVerificationCount(Number(req.params.id));
  res.json({ ok: true });
});

const trackDownload = asyncHandler(async (req, res) => {
  await projectService.incrementDownloadCount(Number(req.params.id));
  res.json({ ok: true });
});

module.exports = {
  listProjects,
  getProject,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  trackView,
  trackFailedVerification,
  trackDownload,
};
