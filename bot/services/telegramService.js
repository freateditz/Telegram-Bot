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

    if (!resource || !resource.downloadLink || !resource.fixLink || !resource.tutorialChannelId || !resource.tutorialMessageId) {
        return bot.sendMessage(
            chatId,
            "This resource is not configured yet.",
            {
                reply_markup: dynamicKeyboard.buildResourceDetailsKeyboard(platformSlug, resource?.category?.slug || "software"),
            }
        );
    }

    await bot.sendMessage(
        chatId,
        `🔥 *${resource.name}*\n\n⬇ *Download Link*\n${resource.downloadLink}\n\n🛠 *Fix File*\n${resource.fixLink}`,
        {
            parse_mode: "Markdown",
            reply_markup: dynamicKeyboard.buildResourceDetailsKeyboard(platformSlug, resource.category.slug),
        }
    );

    return bot.copyMessage(
        chatId,
        resource.tutorialChannelId,
        resource.tutorialMessageId
    );
}

module.exports = {
    sendVerificationPrompt,
    showHome,
    showCategoryMenu,
    showResourceMenu,
    sendResourceDetails,
};