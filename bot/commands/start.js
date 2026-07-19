const telegramService = require("../services/telegramService");
const backendClient = require("../services/backendClient");

module.exports = function registerStartCommand(bot) {
    bot.onText(/^\/start(?:\s|$)/i, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        await backendClient.markUnverified(userId);

        const prompt = await backendClient.getVerificationPrompt();
        return telegramService.sendVerificationPrompt(bot, chatId, prompt);
    });
};