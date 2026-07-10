const telegramService = require("../services/telegramService");
const verificationService = require("../services/verificationService");

module.exports = async function handleMessage(bot, msg) {
    if (!msg.text) {
        return;
    }

    if (msg.text === "/start") {
        return;
    }

    if (!msg.text.startsWith("/")) {
        return;
    }

    if (!verificationService.isVerified(msg.from.id)) {
        return telegramService.sendVerificationPrompt(bot, msg.chat.id);
    }

    return bot.sendMessage(
        msg.chat.id,
        `Only /start is available now. Use the inline buttons to navigate.`
    );
};