const apiRoutes = require("../../shared/apiRoutes");

function getBaseUrl() {
    return process.env.BACKEND_BASE_URL || `http://127.0.0.1:${process.env.BACKEND_PORT || process.env.PORT || 3000}`;
}

async function request(path, options = {}) {
    const response = await fetch(`${getBaseUrl()}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload.error || `Request failed: ${response.status}`);
    }

    return payload;
}

async function getProject(slug) {
    const payload = await request(apiRoutes.projects.detail(slug));
    return payload.item || null;
}

async function getProjectById(id) {
    const payload = await request(apiRoutes.projects.byId(id));
    return payload.item || null;
}

/**
 * Returns the project plus a `delivery` block describing exactly which
 * strategy the bot should use:
 *   { item, delivery: { strategy: "channel", chatId, messageId, channelName } }
 *   { item, delivery: { strategy: "file", fileId } }
 *   { item, delivery: { strategy: "link", messageLink } }
 *   { item, delivery: { strategy: "unavailable", reason } }
 *
 * The bot never inspects / parses any URLs itself; the backend does
 * the channel/message validation up front and the bot just dispatches.
 */
async function getProjectDelivery(slug) {
    return request(apiRoutes.projects.delivery(slug));
}

module.exports = {
    getProject,
    getProjectById,
    getProjectDelivery,
};
