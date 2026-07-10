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

async function listMenuResources(platform, category) {
    const payload = await request(apiRoutes.resources.menu(platform, category));
    return payload.items || [];
}

async function getResource(platform, slug) {
    const payload = await request(apiRoutes.resources.detail(platform, slug));
    return payload.item || null;
}

module.exports = {
    getVerificationPrompt,
    getVerificationStatus,
    listPlatforms,
    listCategories,
    checkChannelMember,
    markVerified,
    listMenuResources,
    getResource,
};