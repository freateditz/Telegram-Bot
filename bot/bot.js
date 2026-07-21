require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const registerStartCommand = require("./commands/start");
const handleCallbackQuery = require("./handlers/callbackHandler");
const handleMessage = require("./handlers/messageHandler");

let botInstance;

function createBotClient() {
    const botToken = process.env.BOT_TOKEN;

    if (!botToken || !botToken.trim()) {
        throw new Error("BOT_TOKEN is missing or empty in environment variables");
    }

    return new TelegramBot(botToken, {
        polling: true,
    });
}

async function startBot() {
    if (botInstance) {
        return botInstance;
    }

    const bot = createBotClient();

    registerStartCommand(bot);

    bot.on("callback_query", (query) => {
        handleCallbackQuery(bot, query).catch((error) => {
            console.error("Callback handler error:", error);
        });
    });

    bot.on("message", (msg) => {
        handleMessage(bot, msg).catch((error) => {
            console.error("Message handler error:", error);
        });
    });

    bot.on("polling_error", (error) => {
        console.error("Polling error:", error);
    });

    botInstance = bot;

    console.log("✅ Telegram Bot Started");
    console.log("✅ Polling Started");

    return botInstance;
}

if (require.main === module) {
    startBot().catch((error) => {
        console.error("Bot failed to start:", error);
        process.exit(1);
    });
}

module.exports = {
    startBot,
};
