const telegramService = require("../services/telegramService");
const backendClient = require("../services/backendClient");

module.exports = function registerStartCommand(bot) {
    bot.onText(/^\/start(?:\s|$)/i, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const state = await backendClient.getVerificationStatus(userId);

        if (state.verified) {
            return telegramService.showHome(bot, chatId, backendClient);
        }

        const prompt = await backendClient.getVerificationPrompt();
        return telegramService.sendVerificationPrompt(bot, chatId, prompt);
    });
};