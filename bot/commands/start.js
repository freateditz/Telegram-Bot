const telegramService = require("../services/telegramService");
const backendClient = require("../services/backendClient");
const cacheService = require("../services/cacheService");
const handleProjectDeepLink = require("../handlers/projectHandler");
const { handleResourceDeepLink } = require("../handlers/resourceHandler");

/**
 * Register the /start command.
 *
 * Every /start must begin a completely fresh interaction:
 *   - clear any previously verified flag
 *   - clear any pending project pointer (DB)
 *   - clear any pending resource slug (in-memory cache)
 *   - clear any in-flight verification state held by handlers
 *
 * Only after that purge do we honor a deep-link payload (`project_*`
 * or `resource_*`) by re-stashing the appropriate pointer. A plain
 * /start therefore shows the verification prompt with no
 * carry-over — the bot never re-delivers a previous session's file.
 */
module.exports = function registerStartCommand(bot) {
    bot.onText(/^\/start(?:@[\w_]+)?(?:\s+(.+))?$/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const payload = match[1] ? match[1].trim() : "";

        // Track BOT_START
        try {
            await backendClient.trackAnalyticsEvent({
                userId,
                eventType: 'BOT_START',
                metadata: { payload }
            });
        } catch (err) {
            console.error(`[start] Analytics tracking failed:`, err.message);
        }

        // --- Purge every per-session pointer BEFORE doing anything else. ---
        // This is the single source of truth for "start fresh". It must run
        // for every /start, regardless of whether a deep-link payload is
        // present, so that a prior session can never bleed into the new one.

        // 1. Verified flag — re-run subscription check this session.
        try {
            await backendClient.markUnverified(userId);
        } catch (err) {
            console.error(`[start] markUnverified failed for user=${userId}:`, err.message);
            // Gracefully handle backend failure; do not crash the bot.
            return bot.sendMessage(chatId, "⚠️ Service temporarily unavailable. Please try again later.");
        }

        // 2. Pending project pointer (DB). If a previous deep link set this
        //    and delivery threw before clearPendingProject ran, it would
        //    otherwise survive into the new session and re-deliver the
        //    same file the moment the user clicks Verify again.
        try {
            await backendClient.clearPendingProject(userId);
        } catch (err) {
            console.error(`[start] clearPendingProject failed for user=${userId}:`, err.message);
            // Non-fatal — we still continue. The markUnverified call is
            // the critical one; this is a defense-in-depth cleanup.
        }

        // 3. Pending resource slug (in-memory). Same reason as above:
        //    a leftover slug would cause routeAfterVerification to
        //    re-deliver the previous resource after the user re-verifies.
        try {
            cacheService.clearPendingResource(userId);
        } catch (err) {
            console.error(`[start] clearPendingResource failed for user=${userId}:`, err.message);
        }

        if (payload.startsWith("project_")) {
            return handleProjectDeepLink(bot, chatId, msg);
        }

        if (payload.startsWith("resource_")) {
            return handleResourceDeepLink(bot, chatId, msg);
        }

        // Plain /start — verification is required every session.
        try {
            const prompt = await backendClient.getVerificationPrompt();
            return telegramService.sendVerificationPrompt(bot, chatId, prompt);
        } catch (err) {
            console.error(`[start] getVerificationPrompt failed for user=${userId}:`, err.message);
            return bot.sendMessage(chatId, "⚠️ Service temporarily unavailable. Please try again later.");
        }
    });
};
