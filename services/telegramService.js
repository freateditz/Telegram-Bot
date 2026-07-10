const menus = require("../config/menus");
const commonKeyboard = require("../keyboards/commonKeyboard");
const homeKeyboard = require("../keyboards/homeKeyboard");
const windowsKeyboard = require("../keyboards/windowsKeyboard");
const macKeyboard = require("../keyboards/macKeyboard");
const softwareKeyboard = require("../keyboards/softwareKeyboard");
const resourceService = require("./resourceService");
const verificationService = require("./verificationService");
const { buildTelegramChannelLink } = require("../utils/helpers");

async function sendVerificationPrompt(bot, chatId) {
    const youtubeLink = process.env.YOUTUBE;
    const channelLink = buildTelegramChannelLink(process.env.CHANNEL);

    return bot.sendMessage(
        chatId,
        `🚀 *${menus.titles.verify}*\n\nComplete these steps before accessing downloads.\n\n1️⃣ Subscribe to YouTube\n\n2️⃣ Join Telegram Channel\n\n3️⃣ Click Verify\n\nAfter verification all navigation will be unlocked.`,
        {
            parse_mode: "Markdown",
            reply_markup: commonKeyboard.buildVerificationKeyboard({
                youtubeLink,
                channelLink,
            }),
        }
    );
}

async function showStart(bot, chatId, userId) {
    if (verificationService.isVerified(userId)) {
        return showHome(bot, chatId);
    }

    return sendVerificationPrompt(bot, chatId);
}

async function showHome(bot, chatId) {
    return bot.sendMessage(
        chatId,
        `${menus.titles.home}`,
        {
            reply_markup: homeKeyboard.buildHomeKeyboard(),
        }
    );
}

async function showCategoryMenu(bot, chatId, os) {
    const keyboard = os === "mac"
        ? macKeyboard.buildMacKeyboard()
        : windowsKeyboard.buildWindowsKeyboard();

    return bot.sendMessage(
        chatId,
        `${menus.titles.category}`,
        {
            reply_markup: keyboard,
        }
    );
}

async function showSoftwareMenu(bot, chatId, os, category) {
    const items = resourceService.listResources(os, category);

    return bot.sendMessage(
        chatId,
        items.length ? menus.titles.software : "No resources are configured for this category yet.",
        {
            reply_markup: softwareKeyboard.buildSoftwareKeyboard(os, category, items),
        }
    );
}

async function sendResourceDetails(bot, chatId, os, category, resourceKey) {
    const resource = resourceService.getResource(os, category, resourceKey);
    const backCallbackData = `back:category:${os}:${category}`;

    if (!resource || !resource.download || !resource.fix || !resource.tutorialChannelId || !resource.tutorialMessageId) {
        return bot.sendMessage(
            chatId,
            `This resource is not configured yet.`,
            {
                reply_markup: commonKeyboard.buildNavigationKeyboard(backCallbackData),
            }
        );
    }

    await bot.sendMessage(
        chatId,
        `🔥 *${resource.label}*\n\n⬇ *Download Link*\n${resource.download}\n\n🛠 *Fix File*\n${resource.fix}`,
        {
            parse_mode: "Markdown",
            reply_markup: commonKeyboard.buildNavigationKeyboard(backCallbackData),
        }
    );

    return bot.copyMessage(
        chatId,
        resource.tutorialChannelId,
        resource.tutorialMessageId
    );
}

async function sendResourceUnavailable(bot, chatId, os) {
    return bot.sendMessage(
        chatId,
        `No resources are configured for this category yet.`,
        {
            reply_markup: commonKeyboard.buildNavigationKeyboard(`back:os:${os}`),
        }
    );
}

module.exports = {
    sendVerificationPrompt,
    showStart,
    showHome,
    showCategoryMenu,
    showSoftwareMenu,
    sendResourceDetails,
    sendResourceUnavailable,
};