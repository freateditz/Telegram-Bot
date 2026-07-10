function humanizeKey(key) {
    return key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isResourceItem(value) {
    return Boolean(
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.prototype.hasOwnProperty.call(value, "download") &&
        Object.prototype.hasOwnProperty.call(value, "fix") &&
        Object.prototype.hasOwnProperty.call(value, "tutorialChannelId") &&
        Object.prototype.hasOwnProperty.call(value, "tutorialMessageId")
    );
}

function getResourceLabel(resource, key) {
    return resource.label || humanizeKey(key);
}

function buildTelegramChannelLink(channelId) {
    if (!channelId) {
        return "";
    }

    if (String(channelId).startsWith("@")) {
        return `https://t.me/${String(channelId).slice(1)}`;
    }

    return "https://t.me/freat_editz";
}

module.exports = {
    humanizeKey,
    isResourceItem,
    getResourceLabel,
    buildTelegramChannelLink,
};