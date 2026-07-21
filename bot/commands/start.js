const telegramService = require("../services/telegramService");
const backendClient = require("../services/backendClient");
const handleProjectDeepLink = require("../handlers/projectHandler");

/**
 * Register the /start command.
 *
 * Verification is per-session. Every /start — whether plain or with
 * a `project_<slug>` deep-link payload — wipes the user's verified
 * flag before any routing happens. The user must click Verify in the
 * current session to access the main menu or download a project.
 *
 * This is intentional: a user may subscribe, download, unsubscribe,
 * and come back later. The bot must detect that on the next /start
 * and force them through verification again. Sticky verification
 * would let unsubscribed users keep downloading.
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

        // ALWAYS reset the verified flag at the start of a session.
        // Errors here are non-fatal — the worst case is the next
        // verification check has to do its own work anyway.
        try {
            await backendClient.markUnverified(userId);
        } catch (err) {
            console.error(`[start] markUnverified failed for user=${userId}:`, err.message);
        }

        // Deep link: forward to the project flow. The handler will
        // show the verification prompt (because we just reset the
        // flag) and the project will be delivered after the user
        // clicks Verify and passes the subscription check.
        if (payload.startsWith("project_")) {
            return handleProjectDeepLink(bot, chatId, msg);
        }

        // Plain /start — verification is required every session.
        const prompt = await backendClient.getVerificationPrompt();
        return telegramService.sendVerificationPrompt(bot, chatId, prompt);
    });
};
