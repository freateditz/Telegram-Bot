const env = require("../config/env");
const HttpError = require("../utils/httpError");
const userService = require("./userService");
const settingService = require("./settingService");

function buildChannelLink(channel) {
    if (!channel) {
        return "";
    }

    if (String(channel).startsWith("@")) {
        return `https://t.me/${String(channel).slice(1)}`;
    }

    return "https://t.me/freat_editz";
}

async function getVerificationPrompt() {
    const youtubeSetting = await settingService.getSettingByKey("youtubeLink");
    const channelSetting = await settingService.getSettingByKey("channelLink");

    return {
        ok: true,
        title: "Welcome to Freat Editz Download Bot",
        message: "Complete these steps before accessing downloads.",
        steps: [
            "Subscribe to YouTube",
            "Join Telegram Channel",
            "Click Verify",
        ],
        youtubeLink: youtubeSetting?.value || env.youtubeUrl || "",
        channelLink: channelSetting?.value || env.channelLink || buildChannelLink(env.telegramChannel),
    };
}

async function getVerificationStatus(telegramId) {
    const user = await userService.getUserByTelegramId(telegramId);

    return {
        ok: true,
        verified: Boolean(user?.verified),
        user: user || null,
    };
}

async function markVerified(telegramId) {
    return userService.markVerifiedByTelegramId(telegramId);
}

async function isChannelMember(telegramId) {
    if (!env.telegramChannel || !env.botToken) {
        throw new HttpError(500, "Telegram verification configuration is missing");
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${env.botToken}/getChatMember`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: env.telegramChannel,
                user_id: Number(telegramId),
            }),
        });

        const payload = await response.json();

        if (!payload.ok) {
            return false;
        }

        return ["member", "administrator", "creator"].includes(payload.result.status);
    } catch (error) {
        console.log("Verification Error:", error.message);
        return false;
    }
}

module.exports = {
    getVerificationPrompt,
    getVerificationStatus,
    markVerified,
    isChannelMember,
    buildChannelLink,
};