require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const registerStartCommand = require("./commands/start");
const handleCallbackQuery = require("./handlers/callbackHandler");
const handleMessage = require("./handlers/messageHandler");

const botToken = process.env.BOT_TOKEN;

if (!botToken) {
    console.log("❌ BOT_TOKEN missing in .env");
    process.exit(1);
}

const bot = new TelegramBot(botToken, {
    polling: true,
});

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

console.log("✅ Bot Started");
console.log("🤖 Bot is running...");