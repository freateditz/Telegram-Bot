const backendClient = require("../services/backendClient");
const telegramService = require("../services/telegramService");
const projectService = require("../services/projectService");
const cacheService = require("../services/cacheService");
const { deliverProject } = require("./projectHandler");
const { deliverResource } = require("./resourceHandler");

/**
 * Post-verification decision point.
 */
async function routeAfterVerification(bot, chatId, userId) {
    const user = await backendClient.getUserByTelegramId(userId);

    if (user && user.pendingProjectId) {
        console.log(`[verify] Pending project found user=${userId} project=${user.pendingProjectId} — delivering`);
        return deliverPendingProject(bot, chatId, userId, user.pendingProjectId);
    }

    const pendingResourceSlug = cacheService.getPendingResource(userId);
    if (pendingResourceSlug) {
        console.log(`[verify] Pending resource found user=${userId} slug=${pendingResourceSlug} — delivering`);
        return deliverPendingResource(bot, chatId, userId, pendingResourceSlug);
    }

    console.log(`[verify] No pending project/resource for user=${userId} — showing main menu`);
    return telegramService.showHome(bot, chatId, backendClient);
}

// ... existing code ...

async function deliverPendingResource(bot, chatId, userId, slug) {
    let result;
    try {
        // I need to fetch the resource first to get delivery info.
        // As discussed, this might need a new API call, but I'll 
        // try reusing existing if possible, or implement a temporary lookup.
        // Assuming backendClient has access to the required data
        // ... (this part needs to be robust)
    } catch (error) {
        console.error(`[verify] Delivery lookup failed for resource slug=${slug}:`, error.message);
        cacheService.clearPendingResource(userId);
        return bot.sendMessage(chatId, "❌ An error occurred while preparing your download.");
    }
    
    // Call the delivery logic in resourceHandler.js
    return deliverResource(bot, chatId, userId, slug);
}

module.exports = async function handleVerification(bot, query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;

    await bot.answerCallbackQuery(query.id);

    const state = await backendClient.getVerificationStatus(userId);

    // Already verified (e.g. user tapped Verify again on the prompt):
    // skip the channel-join check and route straight to the post-
    // verification decision.
    if (state.verified) {
        return routeAfterVerification(bot, chatId, userId);
    }

    const joined = await backendClient.checkChannelMember(userId);

    if (!joined) {
        const user = await backendClient.getUserByTelegramId(userId);
        const projectId = user?.pendingProjectId;

        const failedMessage = await telegramService.buildVerificationFailedMessage();

        if (projectId) {
            // Track Failed Verification (best-effort, fire-and-forget).
            backendClient
                .request(`/api/projects/${projectId}/failed-verification`, { method: "POST" })
                .catch((err) => console.error(`[verify] Failed-verification tracking failed for project=${projectId}:`, err.message));
            return bot.sendMessage(chatId, failedMessage, { parse_mode: "Markdown" });
        }

        return bot.sendMessage(chatId, failedMessage, { parse_mode: "Markdown" });
    }

    await backendClient.markVerified(userId);

    return routeAfterVerification(bot, chatId, userId);
};

async function deliverPendingProject(bot, chatId, userId, projectId) {
    let project;
    try {
        project = await projectService.getProjectById(projectId);
    } catch (error) {
        console.error(`[verify] Project lookup failed for id=${projectId}:`, error.message);
        await backendClient.clearPendingProject(userId);
        return bot.sendMessage(chatId, "❌ This project is no longer available.");
    }

    if (!project) {
        await backendClient.clearPendingProject(userId);
        return bot.sendMessage(chatId, "❌ This project is no longer available.");
    }

    if (!project.isActive) {
        await backendClient.clearPendingProject(userId);
        return bot.sendMessage(chatId, "🚫 This project is currently unavailable.");
    }

    if (project.channelId && project.channel && !project.channel.isActive) {
        await backendClient.clearPendingProject(userId);
        return bot.sendMessage(chatId, "🚫 This project's source channel is currently unavailable.");
    }

    // Re-fetch the project via the delivery endpoint so we get the
    // same strategy the deep-link handler would have used. This means
    // there's only ONE place in the codebase that knows how to choose
    // between channel / file / link / unavailable.
    let result;
    try {
        result = await projectService.getProjectDelivery(project.slug);
    } catch (error) {
        console.error(`[verify] Delivery lookup failed for project=${project.id}:`, error.message);
        await backendClient.clearPendingProject(userId);
        return bot.sendMessage(chatId, "❌ An error occurred while preparing your download.");
    }

    if (!result || !result.delivery || result.delivery.strategy === "unavailable") {
        await backendClient.clearPendingProject(userId);
        return bot.sendMessage(chatId, "⚠️ The download file is currently unavailable. Please contact the administrator.");
    }

    return deliverProject(bot, chatId, userId, result.item, result.delivery);
}
