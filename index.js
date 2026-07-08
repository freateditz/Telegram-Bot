require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

// -------------------------
// Configuration
// -------------------------
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL = process.env.CHANNEL;
const YOUTUBE = process.env.YOUTUBE;
const CHANNEL_LINK = "https://t.me/freat_editz";

if (!BOT_TOKEN) {
    console.log("❌ BOT_TOKEN missing in .env");
    process.exit();
}

const bot = new TelegramBot(BOT_TOKEN, {
    polling: true,
});

console.log("✅ Bot Started");

// -------------------------
// Load Verified Users
// -------------------------
let verifiedUsers = {};

if (fs.existsSync("users.json")) {
    try {
        verifiedUsers = JSON.parse(
            fs.readFileSync("users.json", "utf8")
        );
    } catch (err) {
        verifiedUsers = {};
    }
}

function saveUsers() {
    fs.writeFileSync(
        "users.json",
        JSON.stringify(verifiedUsers, null, 2)
    );
}

function isVerified(userId) {
    return verifiedUsers[userId] === true;
}

// -------------------------
// Check Telegram Channel Join
// -------------------------
async function isMember(userId) {
    try {
        const member = await bot.getChatMember(CHANNEL, userId);

        return [
            "member",
            "administrator",
            "creator"
        ].includes(member.status);

    } catch (err) {
        console.log("Verification Error:", err.message);
        return false;
    }
}

// -------------------------
// START
// -------------------------
bot.onText(/\/start/, (msg) => {

    const chatId = msg.chat.id;

    bot.sendMessage(
        chatId,
`🚀 *Welcome to Freat Editz Download Bot*

Complete these steps before accessing downloads.

1️⃣ Subscribe to YouTube

2️⃣ Join Telegram Channel

3️⃣ Click Verify

After verification all commands will be unlocked.`,
        {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "📺 Subscribe",
                            url: YOUTUBE
                        }
                    ],
                    [
                        {
                            text: "📢 Join Telegram",
                            url: CHANNEL_LINK
                        }
                    ],
                    [
                        {
                            text: "✅ Verify",
                            callback_data: "verify"
                        }
                    ]
                ]
            }
        }
    );

});

// -------------------------
// VERIFY BUTTON
// -------------------------
bot.on("callback_query", async (query) => {

    const chatId = query.message.chat.id;
    const userId = query.from.id;

    if (query.data !== "verify") return;

    const joined = await isMember(userId);

    if (!joined) {

        bot.answerCallbackQuery(query.id);

        return bot.sendMessage(
            chatId,
`❌ Verification Failed

please subscribe to the YouTube channel first.

Please join our Telegram channel first.

Then click Verify again.`
        );

    }

    verifiedUsers[userId] = true;

    saveUsers();

    bot.answerCallbackQuery(query.id, {
        text: "Verified Successfully!"
    });

    bot.sendMessage(
        chatId,
`🎉 *Verification Successful!*

Available Commands

/topaz

More commands coming soon.`,
        {
            parse_mode: "Markdown"
        }
    );

});

// -------------------------
// TOPAZ
// -------------------------
// -------------------------
// BLOCK ALL OTHER COMMANDS
// -------------------------
bot.on("message", (msg) => {

    if (!msg.text) return;

    if (
        msg.text === "/start" ||
        msg.text === "/topaz"
    ) {
        return;
    }

    if (
        msg.text.startsWith("/") &&
        !isVerified(msg.from.id)
    ) {

        bot.sendMessage(
            msg.chat.id,
`🔒 Please verify first.

Type /start`
        );

    }

});

const topazCommand = require("./commands/topaz");

topazCommand(bot, isVerified);

console.log("🤖 Bot is running...");