const prisma = require("../database/prisma");
const HttpError = require("../utils/httpError");

async function listSettings() {
  return prisma.setting.findMany({ orderBy: [{ key: "asc" }] });
}

async function getSetting(id) {
  return prisma.setting.findUnique({ where: { id } });
}

async function getSettingByKey(key) {
  return prisma.setting.findUnique({ where: { key } });
}

async function createSetting(payload) {
  const key = String(payload.key || "").trim();
  const value = String(payload.value || "");

  if (!key) {
    throw new HttpError(400, "key is required");
  }

  return prisma.setting.create({ data: { key, value } });
}

async function updateSetting(id, payload) {
  const data = {};

  if (payload.key !== undefined) {
    data.key = String(payload.key).trim();
  }

  if (payload.value !== undefined) {
    data.value = String(payload.value);
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, "At least one field is required");
  }

  return prisma.setting.update({ where: { id }, data });
}

async function deleteSetting(id) {
  return prisma.setting.delete({ where: { id } });
}

module.exports = {
  listSettings,
  getSetting,
  getSettingByKey,
  createSetting,
  updateSetting,
  deleteSetting,
};