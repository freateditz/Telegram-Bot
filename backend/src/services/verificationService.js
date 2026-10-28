const env = require("../config/env");
const HttpError = require("../utils/httpError");
const userService = require("./userService");
const settingService = require("./settingService");

function buildChannelLink(channel) {
    if (!channel) {
        return "";
    }
    const trimmed = String(channel).trim();
    if (trimmed.startsWith("@")) {
        return `https://t.me/${trimmed.slice(1)}`;
    }
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
    }
    return `https://t.me/${trimmed}`;
}

async function getVerificationPrompt() {
    const youtubeSetting = await settingService.getSettingByKey("youtubeLink");
    const channelSetting = await settingService.getSettingByKey("channelLink");

    const rawChannel = channelSetting?.value || env.channelLink || env.telegramChannel;
    const channelLink = buildChannelLink(rawChannel);

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
        channelLink,
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

async function markUnverified(telegramId) {
    return userService.markUnverifiedByTelegramId(telegramId);
}

function normalizeChatId(raw) {
    if (!raw) return "";
    let cleaned = String(raw).trim();
    // Strip protocol and t.me/ or telegram.me/
    cleaned = cleaned.replace(/^https?:\/\/(www\.)?(t|telegram)\.me\//i, "");
    // Remove query params and trailing slashes
    cleaned = cleaned.split("?")[0].replace(/\/+$/, "").trim();
    if (/^-?\d+$/.test(cleaned)) {
        return cleaned;
    }
    if (cleaned && !cleaned.startsWith("@")) {
        return "@" + cleaned;
    }
    return cleaned;
}

async function isChannelMember(telegramId) {
    let rawChannel = env.telegramChannel;
    if (!rawChannel) {
        const channelSetting = await settingService.getSettingByKey("channelLink");
        rawChannel = channelSetting?.value || "";
    }

    if (!rawChannel || !env.botToken) {
        console.error("[isChannelMember] Verification configuration is missing:", {
            hasChannel: Boolean(rawChannel),
            hasBotToken: Boolean(env.botToken),
        });
        throw new HttpError(500, "Telegram verification configuration is missing");
    }

    const chatId = normalizeChatId(rawChannel);

    try {
        const response = await fetch(`https://api.telegram.org/bot${env.botToken}/getChatMember`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: chatId,
                user_id: Number(telegramId),
            }),
        });

        const payload = await response.json();

        if (!payload.ok) {
            console.error(`[isChannelMember] Telegram getChatMember error for user=${telegramId} chat=${chatId}:`, payload.description);
            return false;
        }

        const status = payload.result?.status;
        const isMember = payload.result?.is_member;

        return ["member", "administrator", "creator"].includes(status) || (status === "restricted" && isMember === true);
    } catch (error) {
        console.error(`[isChannelMember] Error checking channel membership for user=${telegramId}:`, error.message);
        return false;
    }
}

module.exports = {
    getVerificationPrompt,
    getVerificationStatus,
    markVerified,
    markUnverified,
    isChannelMember,
    buildChannelLink,
};