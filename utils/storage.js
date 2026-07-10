const fs = require("fs");
const path = require("path");

const primaryUsersFile = path.join(__dirname, "..", "data", "users.json");
const legacyUsersFile = path.join(__dirname, "..", "users.json");

function readJson(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return {};
        }

        const rawContent = fs.readFileSync(filePath, "utf8");

        if (!rawContent.trim()) {
            return {};
        }

        const parsed = JSON.parse(rawContent);

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return {};
        }

        return parsed;
    } catch (error) {
        return {};
    }
}

function ensureDirectory(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readUsers() {
    const primaryUsers = readJson(primaryUsersFile);
    const legacyUsers = readJson(legacyUsersFile);

    return {
        ...legacyUsers,
        ...primaryUsers,
    };
}

function writeUsers(users) {
    const payload = JSON.stringify(users, null, 2);

    ensureDirectory(primaryUsersFile);
    fs.writeFileSync(primaryUsersFile, payload);

    ensureDirectory(legacyUsersFile);
    fs.writeFileSync(legacyUsersFile, payload);
}

module.exports = {
    readUsers,
    writeUsers,
};