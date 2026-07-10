function buildTelegramChannelLink(channel) {
    if (!channel) {
        return "";
    }

    if (String(channel).startsWith("@")) {
        return `https://t.me/${String(channel).slice(1)}`;
    }

    return "https://t.me/freat_editz";
}

module.exports = {
    buildTelegramChannelLink,
};