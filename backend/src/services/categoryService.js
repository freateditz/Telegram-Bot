const prisma = require("../database/prisma");
const HttpError = require("../utils/httpError");
const { toSlug } = require("../utils/slug");

async function listCategories() {
  return prisma.category.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }] });
}

async function getCategory(id) {
  return prisma.category.findUnique({ where: { id } });
}

async function createCategory(payload) {
  const name = String(payload.name || "").trim();
  const slug = String(payload.slug || toSlug(name)).trim();
  const displayOrder = Number.isFinite(Number(payload.displayOrder)) ? Number(payload.displayOrder) : 0;

  if (!name || !slug) {
    throw new HttpError(400, "name and slug are required");
  }

  return prisma.category.create({
    data: { name, slug, displayOrder },
  });
}

async function updateCategory(id, payload) {
  const data = {};

  if (payload.name !== undefined) {
    data.name = String(payload.name).trim();
  }

  if (payload.slug !== undefined) {
    data.slug = String(payload.slug).trim() || toSlug(payload.name || "");
  }

  if (payload.displayOrder !== undefined) {
    data.displayOrder = Number(payload.displayOrder);
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, "At least one field is required");
  }

  return prisma.category.update({ where: { id }, data });
}

async function deleteCategory(id) {
  return prisma.category.delete({ where: { id } });
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};