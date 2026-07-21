const commonKeyboard = require("../keyboards/commonKeyboard");
const dynamicKeyboard = require("../keyboards/dynamicKeyboard");

// Helper to disable previous inline keyboards
async function disablePreviousKeyboard(bot, query) {
    if (query.message && query.message.reply_markup && query.message.reply_markup.inline_keyboard) {
        try {
            await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id
            });
        } catch (error) {
            // Ignore errors if message is already deleted or keyboard is already empty
        }
    }
}

/**
 * Verification prompt body. Short, scannable, and aligned with the
 * `Check Access` button. No marketing copy, no long paragraphs.
 */
const VERIFICATION_PROMPT =
`🚀 *Welcome to Freat Editz Resources*

Complete these 2 quick steps to unlock your download.

📺 *Subscribe* to our YouTube Channel
📢 *Join* our Telegram Channel

✅ Once done, tap *"Check Access"* below.`;

/**
 * Shown when the user clicks Verify but is not subscribed yet.
 * Mirrors the prompt structure for visual consistency.
 */
const VERIFICATION_FAILED =
`❌ *Access Not Unlocked Yet*

Please complete these steps:

📺 *Subscribe to our YouTube Channel*
📢 *Join our Telegram Channel*

✅ Then tap *"Check Access"* again.`;

async function buildVerificationMessage(_prompt) {
    // _prompt is reserved for future dynamic injection (e.g. a
    // personalized greeting). Today the body is static.
    return VERIFICATION_PROMPT;
}

async function buildVerificationFailedMessage() {
    return VERIFICATION_FAILED;
}

async function showHome(bot, chatId, backendClient, query = null) {
    if (query) await disablePreviousKeyboard(bot, query);
    
    const platforms = await backendClient.listPlatforms();

    if (platforms.length === 0) {
        return bot.sendMessage(chatId, "No platforms are configured yet.");
    }

    return bot.sendMessage(chatId, "Choose Operating System", {
        reply_markup: dynamicKeyboard.buildPlatformKeyboard(platforms),
    });
}

async function showCategoryMenu(bot, chatId, platformSlug, backendClient, query) {
    await disablePreviousKeyboard(bot, query);
    
    const platformName = platformSlug.charAt(0).toUpperCase() + platformSlug.slice(1);
    await bot.sendMessage(chatId, `🖥 *Selected OS*\n${platformName}\n\n------------------`, { parse_mode: 'Markdown' });

    const categories = await backendClient.listCategories();

    return bot.sendMessage(chatId, "📂 Choose Category", {
        reply_markup: dynamicKeyboard.buildCategoryKeyboard(platformSlug, categories),
    });
}

async function sendVerificationPrompt(bot, chatId, prompt) {
    return bot.sendMessage(
        chatId,
        await buildVerificationMessage(prompt),
        {
            parse_mode: "Markdown",
            reply_markup: commonKeyboard.buildVerificationKeyboard({
                youtubeLink: prompt.youtubeLink,
                channelLink: prompt.channelLink,
            }),
        }
    );
}

async function showResourceMenu(bot, chatId, platformSlug, categorySlug, backendClient, query) {
    await disablePreviousKeyboard(bot, query);

    const categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
    await bot.sendMessage(chatId, `📂 *Selected Category*\n${categoryName}\n\n------------------`, { parse_mode: 'Markdown' });

    const items = await backendClient.listMenuResources(platformSlug, categorySlug);

    return bot.sendMessage(
        chatId,
        items.length ? "📦 Choose Resource" : "No resources are configured for this category yet.",
        {
            reply_markup: dynamicKeyboard.buildResourceKeyboard(platformSlug, categorySlug, items),
        }
    );
}

async function sendResourceDetails(bot, chatId, platformSlug, resourceSlug, backendClient, query) {
    await disablePreviousKeyboard(bot, query);

    const resource = await backendClient.getResource(platformSlug, resourceSlug);

    if (!resource) {
        return bot.sendMessage(chatId, "Resource not found.");
    }

    await bot.sendMessage(chatId, `📦 *Selected Resource*\n${resource.name}\n\n------------------`, { parse_mode: 'Markdown' });

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

    let messageText = `🔥 *${resource.name}*\n\nChoose what you'd like to access.`;
    if (resource.description) messageText += `\n\n${resource.description}`;

    const keyboard = [];
    if (hasDownload) {
        keyboard.push([{ text: "⬇ Download", url: resource.downloadLink }]);
    }
    if (hasFix) {
        keyboard.push([{ text: "🛠 Fix", url: resource.fixLink }]);
    }
    if (hasTutorial) {
        keyboard.push([{ text: "🎓 Tutorial", callback_data: `tutorial:${resource.tutorialChannelId}:${resource.tutorialMessageId}` }]);
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
    buildVerificationMessage,
    buildVerificationFailedMessage,
    VERIFICATION_PROMPT,
    VERIFICATION_FAILED,
    showHome,
    showCategoryMenu,
    showResourceMenu,
    sendResourceDetails,
    sendTutorial,
};