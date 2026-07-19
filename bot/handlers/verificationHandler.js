const backendClient = require("../services/backendClient");
const telegramService = require("../services/telegramService");

module.exports = async function handleVerification(bot, query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;

    await bot.answerCallbackQuery(query.id);

    const state = await backendClient.getVerificationStatus(userId);

    if (state.verified) {
        return telegramService.showHome(bot, chatId, backendClient);
    }

    const joined = await backendClient.checkChannelMember(userId);

    if (!joined) {
        return bot.sendMessage(
            chatId,
            `❌ Verification Failed\n\nPlease subscribe to our YouTube channel and join our Telegram channel first, then click the "Verify" button again.`
        );
    }

    await backendClient.markVerified(userId);

    await bot.sendMessage(
        chatId,
        `🎉 *Verification Successful!*\n\nYou can now use the inline menus below.`,
        {
            parse_mode: "Markdown",
        }
    );

    return telegramService.showHome(bot, chatId, backendClient);
};