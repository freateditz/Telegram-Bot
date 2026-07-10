const prisma = require("../database/prisma");
const HttpError = require("../utils/httpError");
const { toSlug } = require("../utils/slug");

async function listPlatforms() {
  return prisma.platform.findMany({ orderBy: [{ name: "asc" }] });
}

async function getPlatform(id) {
  return prisma.platform.findUnique({ where: { id } });
}

async function createPlatform(payload) {
  const name = String(payload.name || "").trim();
  const slug = String(payload.slug || toSlug(name)).trim();

  if (!name || !slug) {
    throw new HttpError(400, "name and slug are required");
  }

  return prisma.platform.create({ data: { name, slug } });
}

async function updatePlatform(id, payload) {
  const data = {};

  if (payload.name !== undefined) {
    data.name = String(payload.name).trim();
  }

  if (payload.slug !== undefined) {
    data.slug = String(payload.slug).trim() || toSlug(payload.name || "");
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, "At least one field is required");
  }

  return prisma.platform.update({ where: { id }, data });
}

async function deletePlatform(id) {
  return prisma.platform.delete({ where: { id } });
}

module.exports = {
  listPlatforms,
  getPlatform,
  createPlatform,
  updatePlatform,
  deletePlatform,
};