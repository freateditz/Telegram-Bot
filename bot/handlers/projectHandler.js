const projectService = require("../services/projectService");
const backendClient = require("../services/backendClient");
const commonKeyboard = require("../keyboards/commonKeyboard");

/**
 * Handle a /start project_<slug> deep link.
 *
 * Flow:
 *   1. Extract slug from the payload.
 *   2. Ask the backend for the project + its delivery strategy.
 *   3. If the project is missing / inactive / has no delivery, tell the user.
 *   4. Otherwise set it as the user's pending project, increment the
 *      view counter, and show the verification prompt.
 *
 * Verification is owned by `verificationHandler` — we never re-prompt
 * an already-verified user here. If the user is already verified, we
 * trigger delivery directly instead of asking them to verify again.
 */
async function handleProjectDeepLink(bot, chatId, msg) {
  const text = (msg.text || "").trim();
  const parts = text.split(/\s+/);
  const payload = parts[1] || "";

  // Defensive: ensure the prefix is exactly what the regex in start.js
  // matched. If a caller routed us here without it, fail loud.
  if (!payload.startsWith("project_")) {
    console.warn(`[project] Unexpected payload routed to deep-link handler: "${payload}"`);
    return bot.sendMessage(chatId, "❌ Invalid project link.");
  }

  const slug = payload.slice("project_".length);
  if (!slug) {
    return bot.sendMessage(chatId, "❌ Invalid project link — no slug provided.");
  }

  const telegramId = msg.from.id;
  console.log(`[project] Deep link received user=${telegramId} slug="${slug}"`);

  let result;
  try {
    result = await projectService.getProjectDelivery(slug);
  } catch (error) {
    console.error(`[project] Delivery lookup failed for slug="${slug}":`, error.message);
    return bot.sendMessage(chatId, "❌ An error occurred while looking up the project.");
  }

  if (!result) {
    console.log(`[project] Project not found slug="${slug}"`);
    return bot.sendMessage(chatId, "❌ Project not found.\nThe project may have been removed or the link is invalid.");
  }

  const { item: project, delivery } = result;
  console.log(
    `[project] Resolved id=${project.id} slug="${project.slug}" strategy=${delivery.strategy} isActive=${project.isActive}`
  );

  if (delivery.strategy === "unavailable") {
    const reason = delivery.reason;
    if (reason === "project_inactive") {
      return bot.sendMessage(chatId, "🚫 This project is currently unavailable.");
    }
    if (reason === "channel_inactive") {
      return bot.sendMessage(chatId, "🚫 This project's source channel is currently unavailable. Please contact the administrator.");
    }
    if (reason === "no_delivery") {
      return bot.sendMessage(chatId, "⚠️ The download file is currently unavailable. Please contact the administrator.");
    }
    return bot.sendMessage(chatId, "🚫 This project is currently unavailable.");
  }

  // Track the view (best-effort — never fail the user-facing flow).
  backendClient
    .request(`/api/projects/${project.id}/view`, { method: "POST" })
    .catch((err) => console.error(`[project] View tracking failed for project=${project.id}:`, err.message));

  // Stash the project as pending so the verification handler can
  // resume delivery after the user verifies. This MUST be an upsert
  // — a brand-new user has no row yet and `update` throws P2025.
  try {
    await backendClient.upsertPendingProject(telegramId, project.id);
  } catch (error) {
    console.error(`[project] Failed to set pending project for user=${telegramId} project=${project.id}:`, error.message);
    // Continue — the user can still verify and we'll re-set it then.
  }

  // If the user is already verified, deliver immediately rather than
  // showing the verification prompt a second time.
  try {
    const status = await backendClient.getVerificationStatus(telegramId);
    if (status.verified) {
      console.log(`[project] User ${telegramId} already verified — delivering immediately`);
      return await deliverProject(bot, chatId, telegramId, project, delivery);
    }
  } catch (error) {
    console.error(`[project] Verification status check failed for user=${telegramId}:`, error.message);
    // Fall through to the verification prompt.
  }

  const prompt = await backendClient.getVerificationPrompt();

  const descriptionLine = project.description ? `${project.description}\n\n` : "";
  const message = `📦 *${project.title}*\n\n${descriptionLine}Before downloading complete the following:

✅ Subscribe to our YouTube Channel
✅ Join our Telegram Channel`;

  return bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
    reply_markup: commonKeyboard.buildVerificationKeyboard({
      youtubeLink: prompt.youtubeLink,
      channelLink: prompt.channelLink,
    }),
  });
}

/**
 * Deliver a project to a chat. Called from either the deep-link
 * handler (already verified) or the verification handler.
 *
 * The strategy is decided by the backend — this function just executes
 * the right Telegram call. After delivery it tracks the download and
 * clears the pending pointer.
 */
async function deliverProject(bot, chatId, userId, project, delivery) {
  try {
    await bot.sendMessage(
      chatId,
      "✅ Access Verified!\n\nYour download is ready.\n\nThanks for supporting the channel ❤️"
    );

    if (delivery.strategy === "channel") {
      console.log(
        `[project] copyMessage start user=${userId} project=${project.id} chatId=${delivery.chatId} messageId=${delivery.messageId}`
      );
      await bot.copyMessage(chatId, delivery.chatId, delivery.messageId);
      console.log(`[project] copyMessage success user=${userId} project=${project.id}`);
    } else if (delivery.strategy === "file") {
      console.log(`[project] sendDocument start user=${userId} project=${project.id}`);
      await bot.sendDocument(chatId, delivery.fileId);
      console.log(`[project] sendDocument success user=${userId} project=${project.id}`);
    } else if (delivery.strategy === "link" && delivery.messageLink) {
      // Last-resort fallback: parse a t.me/... link and try to copy.
      const parsed = parseTelegramLink(delivery.messageLink);
      if (!parsed) {
        throw new Error(`Cannot parse legacy message link: ${delivery.messageLink}`);
      }
      console.log(
        `[project] copyMessage (legacy link) start user=${userId} project=${project.id} chatId=${parsed.chatId} messageId=${parsed.messageId}`
      );
      await bot.copyMessage(chatId, parsed.chatId, parsed.messageId);
      console.log(`[project] copyMessage (legacy link) success user=${userId} project=${project.id}`);
    } else {
      throw new Error(`Unknown delivery strategy: ${delivery.strategy}`);
    }

    backendClient
      .request(`/api/projects/${project.id}/download`, { method: "POST" })
      .catch((err) => console.error(`[project] Download tracking failed for project=${project.id}:`, err.message));

    try {
      await backendClient.clearPendingProject(userId);
    } catch (err) {
      console.error(`[project] Failed to clear pending project for user=${userId}:`, err.message);
    }
  } catch (error) {
    console.error(`[project] Delivery failed user=${userId} project=${project.id}:`, error.message);
    return bot.sendMessage(
      chatId,
      "❌ An error occurred while sending the file. Please try again or contact the administrator."
    );
  }
}

/**
 * Parse a `t.me/c/<channel>/<message>` or `t.me/<username>/<message>` URL
 * into a `(chatId, messageId)` pair that the Telegram Bot API accepts.
 * Used only as a legacy fallback for projects that were saved with a
 * link instead of an explicit channel + messageId.
 */
function parseTelegramLink(link) {
  if (!link || typeof link !== "string") return null;
  const cleaned = link.replace(/^https?:\/\/t\.me\//i, "").replace(/\/+$/, "");
  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const messageId = Number(parts[parts.length - 1]);
  if (!Number.isInteger(messageId) || messageId <= 0) return null;

  // t.me/c/CHANNEL_ID/MSG_ID → channel is a numeric chat id (drop the
  // "c" prefix and prepend "-100").
  if (parts[0] === "c" && /^\d+$/.test(parts[1])) {
    return { chatId: `-100${parts[1]}`, messageId };
  }
  // t.me/USERNAME/MSG_ID → channel is a public username.
  return { chatId: `@${parts[0]}`, messageId };
}

module.exports = handleProjectDeepLink;
module.exports.deliverProject = deliverProject;
