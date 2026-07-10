const telegramService = require("../services/telegramService");
const verificationService = require("../services/verificationService");

module.exports = async function handleVerification(bot, query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;

    await bot.answerCallbackQuery(query.id);

    if (verificationService.isVerified(userId)) {
        return telegramService.showHome(bot, chatId);
    }

    const joined = await verificationService.isChannelMember(bot, userId);

    if (!joined) {
        return bot.sendMessage(
            chatId,
            `❌ Verification Failed\n\nPlease join the required channels first, then click Verify again.`
        );
    }

    verificationService.markVerified(userId);

    await bot.sendMessage(
        chatId,
        `🎉 *Verification Successful!*\n\nYou can now use the inline menus below.`,
        {
            parse_mode: "Markdown",
        }
    );

    return telegramService.showHome(bot, chatId);
};