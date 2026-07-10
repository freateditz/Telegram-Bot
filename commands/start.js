const telegramService = require("../services/telegramService");

module.exports = function registerStartCommand(bot) {
    bot.onText(/^\/start(?:\s|$)/i, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        return telegramService.showStart(bot, chatId, userId);
    });
};