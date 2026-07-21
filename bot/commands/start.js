const telegramService = require("../services/telegramService");
const backendClient = require("../services/backendClient");
const handleProjectDeepLink = require("../handlers/projectHandler");

/**
 * Register the /start command.
 *
 * The single biggest source of "deep link behaves like normal /start"
 * was the unconditional `markUnverified(userId)` here — every
 * /start (with or without a payload) wiped the user's verified
 * status, so a previously verified user opening a deep link saw the
 * verification prompt again. Verified state is now sticky and is only
 * cleared by the verification flow itself.
 *
 * The regex matches:
 *   /start
 *   /start project_<anything>
 *   /start@<botname>
 *   /start@<botname> project_<anything>
 */
module.exports = function registerStartCommand(bot) {
    bot.onText(/^\/start(?:@[\w_]+)?(?:\s+(.+))?$/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const payload = match[1] ? match[1].trim() : "";

        // Deep link: forward to the project flow. The handler decides
        // whether the user needs verification or is already verified.
        if (payload.startsWith("project_")) {
            return handleProjectDeepLink(bot, chatId, msg);
        }

        // Plain /start (or /start with an unrecognised payload) — show
        // the verification prompt without disturbing existing state.
        const status = await backendClient.getVerificationStatus(userId);
        if (!status.verified) {
            const prompt = await backendClient.getVerificationPrompt();
            return telegramService.sendVerificationPrompt(bot, chatId, prompt);
        }
        return telegramService.showHome(bot, chatId, backendClient);
    });
};
