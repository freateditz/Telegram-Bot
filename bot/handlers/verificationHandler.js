const backendClient = require("../services/backendClient");
const telegramService = require("../services/telegramService");
const projectService = require("../services/projectService");
const { deliverProject } = require("./projectHandler");

module.exports = async function handleVerification(bot, query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;

    await bot.answerCallbackQuery(query.id);

    const state = await backendClient.getVerificationStatus(userId);
    const user = await backendClient.getUserByTelegramId(userId);

    if (state.verified) {
        if (user && user.pendingProjectId) {
            return await deliverPendingProject(bot, chatId, userId, user.pendingProjectId);
        }
        return telegramService.showHome(bot, chatId, backendClient);
    }

    const joined = await backendClient.checkChannelMember(userId);

    if (!joined) {
        const message = "❌ Access not unlocked yet.\n\nPlease subscribe to our YouTube channel and join our Telegram channel, then press \"Check Access\" again.";

        if (user && user.pendingProjectId) {
             // Track Failed Verification
             backendClient
                 .request(`/api/projects/${user.pendingProjectId}/failed-verification`, { method: "POST" })
                 .catch((err) => console.error(`[verify] Failed-verification tracking failed for project=${user.pendingProjectId}:`, err.message));
             return bot.sendMessage(chatId, message);
        }
        return bot.sendMessage(
            chatId,
            `❌ Verification Failed\n\nPlease subscribe to our YouTube channel and join our Telegram channel first, then click the "Verify" button again.`
        );
    }

    await backendClient.markVerified(userId);

    if (user && user.pendingProjectId) {
        return await deliverPendingProject(bot, chatId, userId, user.pendingProjectId);
    }

    await bot.sendMessage(
        chatId,
        `🎉 *Verification Successful!*\n\nYou can now use the inline menus below.`,
        {
            parse_mode: "Markdown",
        }
    );

    return telegramService.showHome(bot, chatId, backendClient);
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
