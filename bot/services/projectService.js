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
    return request(apiRoutes.projects.detail(slug));
}

async function getProjectById(id) {
    return request(apiRoutes.projects.byId(id));
}

module.exports = {
    getProject,
    getProjectById,
};
