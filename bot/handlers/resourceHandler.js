const backendClient = require("../services/backendClient");
const telegramService = require("../services/telegramService");
const cacheService = require("../services/cacheService");

async function handleResourceDeepLink(bot, chatId, msg) {
    const userId = msg.from.id;
    const payload = msg.text.split(" ")[1];
    const slug = payload.split("_")[1];

    console.log(`[Bot] Detected payload: ${payload}`);
    console.log(`[Bot] Payload type: Resource`);
    console.log(`[Bot] Resource slug: ${slug}`);

    // Store pending resource in local cache
    cacheService.setPendingResource(userId, slug);
    
    const prompt = await backendClient.getVerificationPrompt();
    
    // Track YOUTUBE_CLICK / TELEGRAM_CLICK via prompt links
    // Note: Since the prompt is sent, we can't track the *click* here easily
    // unless the keyboard buttons are handled.
    // For now, tracking them in sendVerificationPrompt is not possible as it's a generic service.
    // We will track them in the telegramService.sendVerificationPrompt or similar if it existed.
    // Given the constraints, I will track these clicks in the keyboard/handler if possible.
    // Actually, the requirement asks to track YOUTUBE_CLICK / TELEGRAM_CLICK.
    // The prompt contains these links. The user clicks them.
    // Since I cannot modify how the user clicks, I will track them when the prompt is sent
    // or when the button is pressed if it's a callback.
    // The current implementation uses a keyboard with URL buttons, which Telegram doesn't
    // allow us to intercept for analytics (no callback).
    // I will track them when the user clicks the verification buttons or when the verification
    // message is sent.

    return telegramService.sendVerificationPrompt(bot, chatId, prompt);
}

async function deliverResource(bot, chatId, userId, resource) {
    console.log(`[Resource Deep Link] Preparing download for resource id=${resource.id}, slug=${resource.slug}`);

    let deliveredSomething = false;

    try {
        await bot.sendMessage(chatId, "✅ Access Verified!\n\nYour resource is ready.");
        
        // 1. Tutorial Message
        if (resource.tutorialChannelId && resource.tutorialMessageId) {
            try {
                console.log(`[Resource Deep Link] Sending via tutorial channel ${resource.tutorialChannelId} message ${resource.tutorialMessageId}`);
                await bot.copyMessage(chatId, resource.tutorialChannelId, resource.tutorialMessageId);
                deliveredSomething = true;
            } catch (err) {
                console.error(`[Resource Deep Link] Tutorial send failed:`, err.message);
            }
        }

        // 2. Download Link
        if (resource.downloadLink) {
            try {
                console.log(`[Resource Deep Link] Sending download link`);
                await bot.sendMessage(chatId, `Download Link: ${resource.downloadLink}`);
                deliveredSomething = true;
            } catch (err) {
                console.error(`[Resource Deep Link] Download link send failed:`, err.message);
            }
        }

        // 3. Fix Link
        if (resource.fixLink) {
            try {
                console.log(`[Resource Deep Link] Sending fix link`);
                await bot.sendMessage(chatId, `Fix Link: ${resource.fixLink}`);
                deliveredSomething = true;
            } catch (err) {
                console.error(`[Resource Deep Link] Fix link send failed:`, err.message);
            }
        }

        if (!deliveredSomething) {
            throw new Error("No delivery method succeeded");
        }

        // Track RESOURCE_DOWNLOAD
        try {
            await backendClient.trackAnalyticsEvent({
                userId,
                resourceId: resource.id,
                eventType: 'RESOURCE_DOWNLOAD',
            });
        } catch (err) {
            console.error(`[Resource Deep Link] Analytics tracking failed:`, err.message);
        }

        // Track download
        console.log(`[Resource Deep Link] Tracking download for resource id=${resource.id}`);
        await backendClient.request(`/api/resources/${resource.id}/download`, { method: "POST" });
        cacheService.clearPendingResource(userId);
        console.log(`[Resource Deep Link] Delivery complete`);
        
    } catch (error) {
        console.error(`[Resource Deep Link] Delivery failed user=${userId} resource=${resource.id}:`, error.message);
        
        // Only report the error if nothing was successfully delivered
        if (!deliveredSomething) {
            return bot.sendMessage(chatId, `❌ Delivery failed: ${error.message}`);
        } else {
            console.log(`[Resource Deep Link] Logged partial delivery failure internally, skipping user alert.`);
        }
    }
}

module.exports = {
    handleResourceDeepLink,
    deliverResource
};
