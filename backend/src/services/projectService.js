const prisma = require("../database/prisma");
const HttpError = require("../utils/httpError");
const { toSlug } = require("../utils/slug");

async function listProjects() {
  return prisma.project.findMany({ orderBy: [{ createdAt: "desc" }] });
}

async function getProject(id) {
  return prisma.project.findUnique({ where: { id } });
}

async function getProjectBySlug(slug) {
  return prisma.project.findUnique({ where: { slug } });
}

async function createProject(payload) {
  const title = String(payload.title || "").trim();
  const slug = String(payload.slug || toSlug(title)).trim();
  const telegramMessageLink = payload.telegramMessageLink ? String(payload.telegramMessageLink).trim() : null;
  const telegramFileId = payload.telegramFileId ? String(payload.telegramFileId).trim() : null;
  const description = payload.description ? String(payload.description).trim() : null;
  const thumbnail = payload.thumbnail ? String(payload.thumbnail).trim() : null;
  const isActive = payload.isActive !== undefined ? Boolean(payload.isActive) : true;

  if (!title || !slug || (!telegramMessageLink && !telegramFileId)) {
    throw new HttpError(400, "title, slug, and either telegramMessageLink or telegramFileId are required");
  }

  // Check unique slug
  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) {
      throw new HttpError(400, "Slug already exists");
  }

  return prisma.project.create({
    data: { title, slug, description, telegramMessageLink, telegramFileId, thumbnail, isActive },
  });
}

async function updateProject(id, payload) {
  const data = {};

  if (payload.title !== undefined) {
    data.title = String(payload.title).trim();
  }

  if (payload.slug !== undefined) {
    data.slug = String(payload.slug).trim() || toSlug(payload.title || "");
    // Check if slug is taken by another project
    const existing = await prisma.project.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (existing) {
        throw new HttpError(400, "Slug already exists");
    }
  }

  if (payload.telegramMessageLink !== undefined) {
    data.telegramMessageLink = payload.telegramMessageLink ? String(payload.telegramMessageLink).trim() : null;
  }

  if (payload.telegramFileId !== undefined) {
    data.telegramFileId = payload.telegramFileId ? String(payload.telegramFileId).trim() : null;
  }

  if (payload.description !== undefined) {
    data.description = payload.description ? String(payload.description).trim() : null;
  }

  if (payload.thumbnail !== undefined) {
    data.thumbnail = payload.thumbnail ? String(payload.thumbnail).trim() : null;
  }

  if (payload.isActive !== undefined) {
    data.isActive = Boolean(payload.isActive);
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, "At least one field is required");
  }

  return prisma.project.update({ where: { id }, data });
}

async function deleteProject(id) {
  return prisma.project.delete({ where: { id } });
}

async function incrementViewCount(id) {
  return prisma.project.update({
    where: { id },
    data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
  });
}

async function incrementFailedVerificationCount(id) {
  return prisma.project.update({
    where: { id },
    data: { failedVerificationCount: { increment: 1 } },
  });
}

async function incrementDownloadCount(id) {
  return prisma.project.update({
    where: { id },
    data: { downloadCount: { increment: 1 }, lastDownloadedAt: new Date() },
  });
}

module.exports = {
  listProjects,
  getProject,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  incrementViewCount,
  incrementFailedVerificationCount,
  incrementDownloadCount,
};
