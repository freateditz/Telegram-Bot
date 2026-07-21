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
 * Builds the verification prompt body. Five premium variants live
 * below — the active copy is `V1_CONVERSION` (highest-converting
 * pick for the editing / After Effects audience). Swap the constant
 * on the `ACTIVE_VARIANT` line below to use a different one; the
 * other four are preserved for A/B testing.
 *
 * Design rules shared by all variants:
 *   - Telegram Markdown (`*bold*`, `_italic_`).
 *   - Each action on its own line; emojis are bullet markers.
 *   - The keyboard already shows "Subscribe" / "Join Telegram" /
 *     "Check Access" — the text never duplicates those labels.
 *   - One call-to-action at the end, aligned with the
 *     `Check Access` button.
 *   - No spam / clickbait / all-caps / multiple exclamation marks.
 */
const VERIFICATION_VARIANTS = {
    // V1 — Conversion-optimized. Lead with the reward, frame the
    // ask as supporting a creator, and end on a single CTA.
    V1_CONVERSION:
`🎬 *Welcome to the Studio*

Thanks for stopping by. You're moments away from unlocking the *full project library* — presets, templates, and AE files shared exclusively with our community.

To keep the downloads free for everyone, we ask for a small show of support:

📺 *Subscribe* to our *YouTube channel*
📢 *Join* our *Telegram channel*

Both take less than a minute. Once you're in, tap *Check Access* below to unlock the library instantly.`,

    // V2 — Minimal, premium restraint. For users who dislike long copy.
    V2_MINIMAL:
`🔓 *Unlock the library*

Two quick steps to get in:

📺 Subscribe to our *YouTube channel*
📢 Join our *Telegram channel*

Then tap *Check Access* to continue.`,

    // V3 — Premium creator / vault framing. For a "studio" brand voice.
    V3_VAULT:
`🏛 *Members-Only Studio Access*

The download vault is reserved for our *active supporters*. Members get instant access to new *premium projects*, *presets*, and *editing resources* the moment they're released.

Complete both steps below to enter:

📺 *Subscribe* on *YouTube*
📢 *Join* the *Telegram channel*

Finished? Tap *Check Access* — your unlock is instant.`,

    // V4 — Friendly community tone. Warmer, more conversational.
    V4_COMMUNITY:
`👋 *Hey, glad you're here*

This little community shares free *editing projects* and *After Effects resources* with everyone who backs the channel.

It takes a moment to get set up:

📺 Subscribe to *YouTube*
📢 Join the *Telegram* crew

Thanks for the support 💛 — tap *Check Access* when you're ready.`,

    // V5 — Achievement / unlock framing. Emphasizes the moment of access.
    V5_UNLOCK:
`✨ *You're almost in*

Two steps and the doors open:

📺 Subscribe on *YouTube*
📢 Join the *Telegram channel*

Complete both, then hit *Check Access* to unlock your download.`
};

const ACTIVE_VARIANT = VERIFICATION_VARIANTS.V1_CONVERSION;

async function buildVerificationMessage(prompt) {
    // The prompt backend payload is currently unused for the body
    // (variants are static copy), but we keep the parameter so the
    // signature stays stable for future dynamic injection (e.g. a
    // personal welcome line derived from the user's first name).
    void prompt;
    return ACTIVE_VARIANT;
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
    VERIFICATION_VARIANTS,
    showHome,
    showCategoryMenu,
    showResourceMenu,
    sendResourceDetails,
    sendTutorial,
};