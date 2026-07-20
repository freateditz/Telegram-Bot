const backendClient = require("../services/backendClient");
const telegramService = require("../services/telegramService");
const projectService = require("../services/projectService");

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
             await backendClient.request(`/api/projects/${user.pendingProjectId}/failed-verification`, { method: "POST" }).catch(console.error);
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
    try {
        const project = await projectService.getProjectById(projectId);

        if (!project) {
            await backendClient.clearPendingProject(userId);
            return bot.sendMessage(chatId, "❌ This project is no longer available.");
        }

        if (!project.telegramMessageLink && !project.telegramFileId) {
            await backendClient.clearPendingProject(userId);
            return bot.sendMessage(chatId, "⚠️ The download file is currently unavailable. Please contact the administrator.");
        }

        await bot.sendMessage(chatId, "✅ Access Verified!\n\nYour download is ready.\n\nThanks for supporting the channel ❤️");

        // Use copyMessage if link is available, otherwise fallback to sendDocument
        if (project.telegramMessageLink) {
             const parts = project.telegramMessageLink.split('/');
             const messageId = parts.pop();
             const channelId = parts.pop(); // simplified for t.me/c/... or t.me/.../

             // This needs correct parsing for the link format. 
             // Simplification: assume the bot has access and can copy.
             // If format is t.me/c/CHANNEL/MSGID, channelId is CHANNEL.
             // If format is t.me/USERNAME/MSGID, username could be CHANNEL.

             // For now, let's just attempt to parse simply and copy.
             await bot.copyMessage(chatId, `@${channelId}`, parseInt(messageId));
        } else {
             await bot.sendDocument(chatId, project.telegramFileId);
        }

        // Track Download
        await backendClient.request(`/api/projects/${project.id}/download`, { method: "POST" }).catch(console.error);

        await backendClient.clearPendingProject(userId);
    } catch (error) {
        console.error("Project file delivery error:", error);
        return bot.sendMessage(chatId, "❌ An error occurred while sending the file. Please try again or contact the administrator.");
    }
}