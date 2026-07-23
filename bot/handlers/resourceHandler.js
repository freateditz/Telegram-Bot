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

        // Track download
        console.log(`[Resource Deep Link] Tracking download for resource id=${resource.id}`);
        await backendClient.request(`/api/resources/${resource.id}/download`, { method: "POST" });
        cacheService.clearPendingResource(userId);
        console.log(`[Resource Deep Link] Delivery complete`);
        
    } catch (error) {
        console.error(`[Resource Deep Link] Delivery failed user=${userId} resource=${resource.id}:`, error.message);
        return bot.sendMessage(chatId, `❌ Delivery failed: ${error.message}`);
    }
}

module.exports = {
    handleResourceDeepLink,
    deliverResource
};
