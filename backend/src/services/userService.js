const prisma = require("../database/prisma");
const HttpError = require("../utils/httpError");

async function listUsers() {
  return prisma.user.findMany({ orderBy: [{ createdAt: "desc" }] });
}

async function getUser(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function getUserByTelegramId(telegramId) {
  return prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
}

async function createUser(payload) {
  const telegramId = String(payload.telegramId || "").trim();
  const verified = payload.verified === undefined ? false : Boolean(payload.verified);

  if (!telegramId) {
    throw new HttpError(400, "telegramId is required");
  }

  return prisma.user.create({ data: { telegramId, verified } });
}

async function updateUser(id, payload) {
  const data = {};

  if (payload.telegramId !== undefined) {
    data.telegramId = String(payload.telegramId).trim();
  }

  if (payload.verified !== undefined) {
    data.verified = Boolean(payload.verified);
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, "At least one field is required");
  }

  return prisma.user.update({ where: { id }, data });
}

async function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}

async function markVerifiedByTelegramId(telegramId) {
  const normalized = String(telegramId).trim();

  if (!normalized) {
    throw new HttpError(400, "telegramId is required");
  }

  return prisma.user.upsert({
    where: { telegramId: normalized },
    create: { telegramId: normalized, verified: true },
    update: { verified: true },
  });
}

module.exports = {
  listUsers,
  getUser,
  getUserByTelegramId,
  createUser,
  updateUser,
  deleteUser,
  markVerifiedByTelegramId,
};