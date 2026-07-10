module.exports = {
    health: "/health",
    platforms: {
        list: "/api/platforms",
    },
    categories: {
        list: "/api/categories",
    },
    verification: {
        prompt: "/api/verification/prompt",
        status: (userId) => `/api/verification/status/${userId}`,
        checkMember: "/api/verification/check-member",
        markVerified: "/api/verification/mark",
    },
    resources: {
        list: "/api/resources",
        menu: (platform, category) => `/api/menu/${platform}/${category}`,
        detail: (platform, slug) => `/api/resource/${platform}/${slug}`,
    },
};