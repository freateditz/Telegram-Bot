const backendClient = require("../services/backendClient");
const telegramService = require("../services/telegramService");
const projectService = require("../services/projectService");
const { deliverProject } = require("./projectHandler");

/**
 * Post-verification decision point. There is exactly ONE place in this
 * handler that decides what happens after the user is verified:
 *
 *   1. If the user has a `pendingProjectId` (they came in through a
 *      deep link), deliver the project and clear the pending pointer.
 *   2. Otherwise, show the normal main menu.
 *
 * This is the single source of truth for "verification succeeded →
 * what next?". Both the already-verified short-circuit and the
 * just-verified path funnel through `routeAfterVerification`.
 */
async function routeAfterVerification(bot, chatId, userId) {
    const user = await backendClient.getUserByTelegramId(userId);

    if (user && user.pendingProjectId) {
        console.log(`[verify] Pending project found user=${userId} project=${user.pendingProjectId} — delivering`);
        return deliverPendingProject(bot, chatId, userId, user.pendingProjectId);
    }

    console.log(`[verify] No pending project for user=${userId} — showing main menu`);
    return telegramService.showHome(bot, chatId, backendClient);
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

        if (projectId) {
            // Track Failed Verification (best-effort, fire-and-forget).
            backendClient
                .request(`/api/projects/${projectId}/failed-verification`, { method: "POST" })
                .catch((err) => console.error(`[verify] Failed-verification tracking failed for project=${projectId}:`, err.message));
            return bot.sendMessage(
                chatId,
                "❌ Access not unlocked yet.\n\nPlease subscribe to our YouTube channel and join our Telegram channel, then press \"Check Access\" again."
            );
        }

        return bot.sendMessage(
            chatId,
            `❌ Verification Failed\n\nPlease subscribe to our YouTube channel and join our Telegram channel first, then click the "Verify" button again.`
        );
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
