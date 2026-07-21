const telegramService = require("../services/telegramService");
const backendClient = require("../services/backendClient");
const handleProjectDeepLink = require("../handlers/projectHandler");

module.exports = function registerStartCommand(bot, backendBaseUrl) {
    bot.onText(/^\/start(?:\s+(.+))?$/i, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const payload = match[1];

        console.log(`[DEBUG] Received /start command. msg.text: "${msg.text}", payload: "${payload}"`);

        if (payload && payload.startsWith("project_")) {
            console.log(`[DEBUG] Routing to handleProjectDeepLink with payload: "${payload}"`);
            return handleProjectDeepLink(bot, chatId, msg);
        }

        await backendClient.markUnverified(userId);

        const prompt = await backendClient.getVerificationPrompt();
        return telegramService.sendVerificationPrompt(bot, chatId, prompt);
    });
};