const resources = require("../config/resources");

module.exports = (bot, isVerified) => {

    bot.onText(/\/topaz/, async (msg) => {

        const chatId = msg.chat.id;
        const userId = msg.from.id;

        if (!isVerified(userId)) {
            return bot.sendMessage(
                chatId,
                "🔒 Please verify first using /start."
            );
        }

        // Send download information
        await bot.sendMessage(
            chatId,
`🔥 *Topaz Video AI*

⬇ *Download Link*
${resources.topaz.download}

🛠 *Fix File*
${resources.topaz.fix}`,
            {
                parse_mode: "Markdown"
            }
        );

        // Copy tutorial from your private channel
        await bot.copyMessage(
            chatId,
            resources.topaz.tutorial.channelId,
            resources.topaz.tutorial.messageId
        );

    });

};