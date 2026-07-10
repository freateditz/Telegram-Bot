const backendClient = require("../services/backendClient");
const telegramService = require("../services/telegramService");

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

    const state = await backendClient.getVerificationStatus(msg.from.id);

    if (!state.verified) {
        const prompt = await backendClient.getVerificationPrompt();
        return telegramService.sendVerificationPrompt(bot, msg.chat.id, prompt);
    }

    return bot.sendMessage(
        msg.chat.id,
        `Only /start is available now. Use the inline buttons to navigate.`
    );
};