const pendingResources = new Map();

function setPendingResource(userId, slug) {
    pendingResources.set(userId, slug);
}

function getPendingResource(userId) {
    return pendingResources.get(userId);
}

function clearPendingResource(userId) {
    pendingResources.delete(userId);
}

module.exports = {
    setPendingResource,
    getPendingResource,
    clearPendingResource,
};
