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

async function deliverResource(bot, chatId, userId, slug) {
    // 1. Fetch resource
    // Need a way to fetch resource by slug. 
    // Since I cannot change backend, I'll attempt a search.
    // Or, assume getResourceBySlug(slug) works if I implement it
    // in backendClient.js. Let me add it there properly.
    
    let resource;
    try {
        resource = await backendClient.getResourceBySlug(slug);
    } catch (error) {
        console.error(`[resource] Delivery lookup failed for slug=${slug}:`, error.message);
        cacheService.clearPendingResource(userId);
        return bot.sendMessage(chatId, "❌ An error occurred while preparing your download.");
    }

    if (!resource) {
        cacheService.clearPendingResource(userId);
        return bot.sendMessage(chatId, "❌ Resource not found.");
    }

    if (!resource.isVisible) {
        cacheService.clearPendingResource(userId);
        return bot.sendMessage(chatId, "🚫 This resource is currently unavailable.");
    }

    // 2. Deliver
    try {
        await bot.sendMessage(chatId, "✅ Access Verified!\n\nYour resource is ready.");

        // Similar to project delivery, use channel/file logic
        if (resource.tutorialChannelId && resource.tutorialMessageId) {
            await bot.copyMessage(chatId, resource.tutorialChannelId, resource.tutorialMessageId);
        } else if (resource.downloadLink) {
            await bot.sendMessage(chatId, `Download Link: ${resource.downloadLink}`);
        } else {
            throw new Error("No delivery method found");
        }

        // Track download
        await backendClient.request(`/api/resources/${resource.id}/download`, { method: "POST" });
        cacheService.clearPendingResource(userId);
        
    } catch (error) {
        console.error(`[resource] Delivery failed user=${userId} resource=${resource.id}:`, error.message);
        return bot.sendMessage(chatId, "❌ Delivery failed.");
    }
}

module.exports = {
    handleResourceDeepLink,
    deliverResource
};
