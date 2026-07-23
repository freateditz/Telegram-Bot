const apiRoutes = require("../../shared/apiRoutes");

function getBaseUrl() {
    return process.env.BACKEND_BASE_URL || `http://127.0.0.1:${process.env.BACKEND_PORT || process.env.PORT || 3000}`;
}

async function request(path, options = {}) {
    const url = `${getBaseUrl()}${path}`;
    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
            ...options,
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            console.error(`[backendClient] Request failed: ${options.method || 'GET'} ${url}`);
            console.error(`[backendClient] Status: ${response.status}`);
            console.error(`[backendClient] Payload:`, payload);
            throw new Error(payload.error || `Request failed: ${response.status}`);
        }

        return payload;
    } catch (err) {
        console.error("--- Backend Request Error ---");
        console.error("Backend URL:", getBaseUrl());
        console.error("HTTP Method:", options.method || "GET");
        console.error("Endpoint:", path);
        console.error("Error:", err.message);
        console.error("Cause:", err.cause);
        console.error("Stack:", err.stack);
        if (options.body) {
            console.error("Request Body:", options.body);
        }
        console.error("-----------------------------");
        throw err;
    }
}

async function getVerificationPrompt() {
    return request(apiRoutes.verification.prompt);
}

async function getVerificationStatus(userId) {
    return request(apiRoutes.verification.status(userId));
}

async function listPlatforms() {
    const payload = await request(apiRoutes.platforms.list);
    return payload.items || [];
}

async function listCategories() {
    const payload = await request(apiRoutes.categories.list);
    return payload.items || [];
}

async function checkChannelMember(userId) {
    const payload = await request(apiRoutes.verification.checkMember, {
        method: "POST",
        body: JSON.stringify({ userId }),
    });

    return payload.joined;
}

async function markVerified(userId) {
    return request(apiRoutes.verification.markVerified, {
        method: "POST",
        body: JSON.stringify({ userId }),
    });
}

async function markUnverified(userId) {
    return request(apiRoutes.verification.unverify, {
        method: "POST",
        body: JSON.stringify({ userId }),
    });
}

async function listMenuResources(platform, category) {
    const payload = await request(apiRoutes.resources.menu(platform, category));
    return payload.items || [];
}
async function getResource(platform, slug) {
    const payload = await request(apiRoutes.resources.detail(platform, slug));
    return payload.item || null;
}

async function getResourceBySlug(slug) {
    // Calling a new endpoint /api/resources/slug/${slug}
    // Assuming backend will handle this or it might fail if not implemented.
    // Given the constraints, this is the best approach.
    const payload = await request(`/api/resources/slug/${slug}`);
    return payload.item || null;
}

async function getUserByTelegramId(telegramId) {
    try {
        const payload = await request(`/api/users/telegram/${telegramId}`);
        // The backend wraps responses in `{ ok, item }`; callers here
        // want the user row directly so they can read fields like
        // `pendingProjectId` without an extra hop.
        return payload?.item ?? null;
    } catch (err) {
        // 404 (no such user) is a normal "no pending project" signal
        // for our caller — surface as null so the verification
        // handler falls through to the main menu.
        if (/User not found|404/i.test(err.message)) {
            return null;
        }
        throw err;
    }
}

/**
 * Idempotent: creates the user row if it doesn't exist, then sets the
 * pending project. Replaces the previous `setPendingProject` which
 * used `update` and would throw Prisma P2025 on first-time users.
 */
async function upsertPendingProject(telegramId, projectId) {
    return request("/api/users/upsert-pending-project", {
        method: "POST",
        body: JSON.stringify({ telegramId, projectId }),
    });
}

async function clearPendingProject(telegramId) {
    return request("/api/users/clear-pending-project", {
        method: "POST",
        body: JSON.stringify({ telegramId }),
    });
}

module.exports = {
    request,
    getVerificationPrompt,
    getVerificationStatus,
    listPlatforms,
    listCategories,
    checkChannelMember,
    markVerified,
    markUnverified,
    listMenuResources,
    getResource,
    getUserByTelegramId,
    upsertPendingProject,
    clearPendingProject,
};
