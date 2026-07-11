require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const registerStartCommand = require("./commands/start");
const handleCallbackQuery = require("./handlers/callbackHandler");
const handleMessage = require("./handlers/messageHandler");

let botInstance;

function getBackendBaseUrl() {
    return process.env.BACKEND_BASE_URL || `http://127.0.0.1:${process.env.BACKEND_PORT || process.env.PORT || 3000}`;
}

function createBotClient() {
    const botToken = process.env.BOT_TOKEN;

    if (!botToken) {
        throw new Error("BOT_TOKEN missing in .env");
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

    registerStartCommand(bot, getBackendBaseUrl());

    bot.on("callback_query", (query) => {
        handleCallbackQuery(bot, query, getBackendBaseUrl()).catch((error) => {
            console.error("Callback handler error:", error);
        });
    });

    bot.on("message", (msg) => {
        handleMessage(bot, msg, getBackendBaseUrl()).catch((error) => {
            console.error("Message handler error:", error);
        });
    });

    bot.on("polling_error", (error) => {
        console.error("Polling error:", error);
    });

    botInstance = bot;

    console.log("✅ Bot Started");
    console.log("🤖 Bot is running...");

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
    getBackendBaseUrl,
};