const path = require("path");
require("dotenv").config();
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
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

async function stopBot() {
    if (botInstance) {
        try {
            console.log("🛑 Stopping Telegram Bot polling...");
            await botInstance.stopPolling();
            console.log("✅ Telegram Bot polling stopped");
        } catch (error) {
            console.error("Error stopping Telegram Bot polling:", error.message || error);
        }
        botInstance = null;
    }
}

if (require.main === module) {
    const shutdown = async () => {
        await stopBot();
        process.exit(0);
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    startBot().catch((error) => {
        console.error("Bot failed to start:", error);
        process.exit(1);
    });
}

module.exports = {
    startBot,
    stopBot,
};
