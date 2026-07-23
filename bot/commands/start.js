const telegramService = require("../services/telegramService");
const backendClient = require("../services/backendClient");
const handleProjectDeepLink = require("../handlers/projectHandler");
const { handleResourceDeepLink } = require("../handlers/resourceHandler");

/**
 * Register the /start command.
 */
module.exports = function registerStartCommand(bot) {
    bot.onText(/^\/start(?:@[\w_]+)?(?:\s+(.+))?$/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const payload = match[1] ? match[1].trim() : "";

        // ALWAYS reset the verified flag at the start of a session.
        try {
            await backendClient.markUnverified(userId);
        } catch (err) {
            console.error(`[start] markUnverified failed for user=${userId}:`, err.message);
        }

        if (payload.startsWith("project_")) {
            return handleProjectDeepLink(bot, chatId, msg);
        }
        
        if (payload.startsWith("resource_")) {
            return handleResourceDeepLink(bot, chatId, msg);
        }

        // Plain /start — verification is required every session.
        const prompt = await backendClient.getVerificationPrompt();
        return telegramService.sendVerificationPrompt(bot, chatId, prompt);
    });
};
