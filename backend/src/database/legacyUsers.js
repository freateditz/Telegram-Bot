const fs = require("fs");
const path = require("path");

const legacyFiles = [
  path.join(__dirname, "..", "..", "..", "data", "users.json"),
  path.join(__dirname, "..", "..", "..", "users.json"),
];

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }

    const raw = fs.readFileSync(filePath, "utf8");

    if (!raw.trim()) {
      return {};
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed;
  } catch (error) {
    return {};
  }
}

function loadLegacyVerifiedUsers() {
  return legacyFiles.reduce((accumulator, filePath) => {
    const users = readJson(filePath);

    Object.entries(users).forEach(([telegramId, verified]) => {
      if (verified) {
        accumulator[telegramId] = true;
      }
    });

    return accumulator;
  }, {});
}

module.exports = {
  loadLegacyVerifiedUsers,
};