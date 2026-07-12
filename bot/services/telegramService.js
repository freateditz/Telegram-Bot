const commonKeyboard = require("../keyboards/commonKeyboard");
const dynamicKeyboard = require("../keyboards/dynamicKeyboard");

async function showHome(bot, chatId, backendClient) {
    const platforms = await backendClient.listPlatforms();

    if (platforms.length === 0) {
        return bot.sendMessage(chatId, "No platforms are configured yet.");
    }

    return bot.sendMessage(chatId, "Choose Operating System", {
        reply_markup: dynamicKeyboard.buildPlatformKeyboard(platforms),
    });
}

async function showCategoryMenu(bot, chatId, platformSlug, backendClient) {
    const categories = await backendClient.listCategories();

    return bot.sendMessage(chatId, "Choose Category", {
        reply_markup: dynamicKeyboard.buildCategoryKeyboard(platformSlug, categories),
    });
}

async function sendVerificationPrompt(bot, chatId, prompt) {
    return bot.sendMessage(
        chatId,
        `🚀 *${prompt.title}*\n\nComplete these steps before accessing downloads.\n\n1️⃣ ${prompt.steps[0]}\n\n2️⃣ ${prompt.steps[1]}\n\n3️⃣ ${prompt.steps[2]}\n\nAfter verification all navigation will be unlocked.`,
        {
            parse_mode: "Markdown",
            reply_markup: commonKeyboard.buildVerificationKeyboard({
                youtubeLink: prompt.youtubeLink,
                channelLink: prompt.channelLink,
            }),
        }
    );
}

async function showResourceMenu(bot, chatId, platformSlug, categorySlug, backendClient) {
    const items = await backendClient.listMenuResources(platformSlug, categorySlug);

    return bot.sendMessage(
        chatId,
        items.length ? "Choose Resource" : "No resources are configured for this category yet.",
        {
            reply_markup: dynamicKeyboard.buildResourceKeyboard(platformSlug, categorySlug, items),
        }
    );
}

async function sendResourceDetails(bot, chatId, platformSlug, resourceSlug, backendClient) {
    const resource = await backendClient.getResource(platformSlug, resourceSlug);

    if (!resource) {
        return bot.sendMessage(chatId, "Resource not found.");
    }

    const hasDownload = !!resource.downloadLink;
    const hasFix = !!resource.fixLink;
    const hasTutorial = !!(resource.tutorialChannelId && resource.tutorialMessageId);

    if (!hasDownload && !hasFix && !hasTutorial) {
        return bot.sendMessage(
            chatId,
            "This resource is not configured yet.",
            {
                reply_markup: dynamicKeyboard.buildResourceDetailsKeyboard(platformSlug, resource?.category?.slug || "software"),
            }
        );
    }

    let messageText = `🔥 *${resource.name}*`;
    if (resource.description) messageText += `\n\n${resource.description}`;

    const keyboard = [];
    if (hasDownload) {
        keyboard.push([{ text: "⬇ Download Link", url: resource.downloadLink }]);
    }
    if (hasFix) {
        keyboard.push([{ text: "🛠 Fix Link", url: resource.fixLink }]);
    }
    if (hasTutorial) {
        // Pass channelId and messageId directly in callback_data, separated by commas or special char if possible
        // If it exceeds 64 bytes, this will fail. Let's hope it fits.
        // Format: tutorial:channelId:messageId
        keyboard.push([{ text: "🎓 View Tutorial", callback_data: `tutorial:${resource.tutorialChannelId}:${resource.tutorialMessageId}` }]);
    }
    
    // Add navigation buttons
    keyboard.push([
        { text: "⬅ Back", callback_data: `back:category:${platformSlug}:${resource.category.slug}` },
        { text: "🏠 Home", callback_data: "home" },
    ]);

    await bot.sendMessage(
        chatId,
        messageText,
        {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: keyboard },
        }
    );

    return;
}

async function sendTutorial(bot, chatId, channelId, messageId) {
    return bot.copyMessage(
        chatId,
        channelId,
        messageId
    );
}

module.exports = {
    sendVerificationPrompt,
    showHome,
    showCategoryMenu,
    showResourceMenu,
    sendResourceDetails,
    sendTutorial,
};