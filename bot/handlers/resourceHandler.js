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

    // 2. Deliver
    try {
        await bot.sendMessage(chatId, "✅ Access Verified!\n\nYour resource is ready.");
        console.log(`[Resource Deep Link] Verification message sent`);

        // Similar to project delivery, use channel/file logic
        if (resource.tutorialChannelId && resource.tutorialMessageId) {
            console.log(`[Resource Deep Link] Sending via tutorial channel ${resource.tutorialChannelId} message ${resource.tutorialMessageId}`);
            await bot.copyMessage(chatId, resource.tutorialChannelId, resource.tutorialMessageId);
            console.log(`[Resource Deep Link] Tutorial sent`);
        } else if (resource.downloadLink) {
            console.log(`[Resource Deep Link] Sending download link`);
            await bot.sendMessage(chatId, `Download Link: ${resource.downloadLink}`);
            console.log(`[Resource Deep Link] Link sent`);
        } else {
            console.error(`[Resource Deep Link] No delivery method found for resource id=${resource.id}`);
            throw new Error("No delivery method found");
        }

        // Track download
        console.log(`[Resource Deep Link] Tracking download for resource id=${resource.id}`);
        await backendClient.request(`/api/resources/${resource.id}/download`, { method: "POST" });
        cacheService.clearPendingResource(userId);
        console.log(`[Resource Deep Link] Delivery complete`);
        
    } catch (error) {
        console.error(`[Resource Deep Link] Delivery failed user=${userId} resource=${resource.id}:`, error.message);
        console.error(error.stack);
        return bot.sendMessage(chatId, `❌ Delivery failed: ${error.message}`);
    }
}

module.exports = {
    handleResourceDeepLink,
    deliverResource
};
