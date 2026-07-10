const resources = require("../config/resources");
const { isResourceItem, getResourceLabel } = require("../utils/helpers");

function getOsBlock(os) {
    return resources[os] || {};
}

function getCollection(os, category) {
    const osBlock = getOsBlock(os);

    if (!category) {
        return osBlock;
    }

    if (category === "software" && osBlock.software && !isResourceItem(osBlock.software)) {
        return osBlock.software;
    }

    if (osBlock[category] && !isResourceItem(osBlock[category])) {
        return osBlock[category];
    }

    if (category === "software") {
        return osBlock;
    }

    return {};
}

function listResources(os, category) {
    const collection = getCollection(os, category);

    return Object.entries(collection)
        .filter(([, resource]) => isResourceItem(resource))
        .map(([key, resource]) => ({
            key,
            label: getResourceLabel(resource, key),
            ...resource,
        }));
}

function getResource(os, category, key) {
    const collection = getCollection(os, category);
    const resource = collection[key];

    if (!isResourceItem(resource)) {
        return null;
    }

    return {
        key,
        label: getResourceLabel(resource, key),
        ...resource,
    };
}

module.exports = {
    listResources,
    getResource,
};