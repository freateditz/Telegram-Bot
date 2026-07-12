const prisma = require("../database/prisma");
const HttpError = require("../utils/httpError");
const { toSlug } = require("../utils/slug");

function toBoolean(value, fallback = true) {
    if (value === undefined) {
        return fallback;
    }

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        return ["true", "1", "yes", "on"].includes(value.toLowerCase());
    }

    return Boolean(value);
}

function toInt(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

async function listResources(filters = {}) {
    const where = {};

    if (filters.platformId) {
        where.platformId = Number(filters.platformId);
    }

    if (filters.categoryId) {
        where.categoryId = Number(filters.categoryId);
    }

    if (filters.isVisible !== undefined) {
        where.isVisible = toBoolean(filters.isVisible, true);
    }

    return prisma.resource.findMany({
        where,
        include: { platform: true, category: true },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
}

async function findPlatformBySlug(slug) {
    return prisma.platform.findUnique({ where: { slug } });
}

async function findCategoryBySlug(slug) {
    return prisma.category.findUnique({ where: { slug } });
}

async function listVisibleResourcesByPlatformAndCategory(platformSlug, categorySlug) {
    const platform = await findPlatformBySlug(platformSlug);

    if (!platform) {
        return null;
    }

    const category = await findCategoryBySlug(categorySlug);

    if (!category) {
        return null;
    }

    return prisma.resource.findMany({
        where: {
            platformId: platform.id,
            categoryId: category.id,
            isVisible: true,
        },
        include: {
            platform: true,
            category: true,
        },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
}

async function getVisibleResourceByPlatformAndSlug(platformSlug, slug) {
    const platform = await findPlatformBySlug(platformSlug);

    if (!platform) {
        return null;
    }

    return prisma.resource.findFirst({
        where: {
            platformId: platform.id,
            slug,
            isVisible: true,
        },
        include: {
            platform: true,
            category: true,
        },
    });
}

async function getResource(id) {
    return prisma.resource.findUnique({
        where: { id },
        include: { platform: true, category: true },
    });
}

async function createResource(payload) {
    const name = String(payload.name || "").trim();
    const slug = String(payload.slug || toSlug(name)).trim();
    const description = String(payload.description || "").trim() || null;
    const version = String(payload.version || "").trim() || null;

    // Explicitly handle nulls for optional fields
    const downloadLink = String(payload.downloadLink || "").trim() || null;
    const fixLink = String(payload.fixLink || "").trim() || null;
    const tutorialChannelId = String(payload.tutorialChannelId || "").trim() || null;
    const tutorialMessageId = payload.tutorialMessageId ? toInt(payload.tutorialMessageId, null) : null;

    const displayOrder = toInt(payload.displayOrder, 0);
    const isVisible = toBoolean(payload.isVisible, true);

    if (!name || !slug) {
        throw new HttpError(400, "name and slug are required");
    }

    const platformId = Number(payload.platformId);
    const categoryId = Number(payload.categoryId);

    if (!Number.isInteger(platformId) || !Number.isInteger(categoryId)) {
        throw new HttpError(400, "platformId and categoryId are required");
    }

    return prisma.resource.create({
        data: {
            name,
            slug,
            description,
            version,
            platformId,
            categoryId,
            downloadLink,
            fixLink,
            tutorialChannelId,
            tutorialMessageId,
            displayOrder,
            isVisible,
        },
        include: { platform: true, category: true },
    });
}

async function updateResource(id, payload) {
    const data = {};

    if (payload.name !== undefined) {
        data.name = String(payload.name).trim();
    }

    if (payload.slug !== undefined) {
        data.slug = String(payload.slug).trim();
    }

    // Handle optional fields with potential null updates
    if (payload.description !== undefined) {
        data.description = String(payload.description || "").trim() || null;
    }

    if (payload.version !== undefined) {
        data.version = String(payload.version || "").trim() || null;
    }

    if (payload.platformId !== undefined) {
        data.platformId = Number(payload.platformId);
    }

    if (payload.categoryId !== undefined) {
        data.categoryId = Number(payload.categoryId);
    }

    if (payload.downloadLink !== undefined) {
        data.downloadLink = String(payload.downloadLink || "").trim() || null;
    }

    if (payload.fixLink !== undefined) {
        data.fixLink = String(payload.fixLink || "").trim() || null;
    }

    if (payload.tutorialChannelId !== undefined) {
        data.tutorialChannelId = String(payload.tutorialChannelId || "").trim() || null;
    }

    if (payload.tutorialMessageId !== undefined) {
        data.tutorialMessageId = payload.tutorialMessageId ? toInt(payload.tutorialMessageId, null) : null;
    }

    if (payload.displayOrder !== undefined) {
        data.displayOrder = toInt(payload.displayOrder, 0);
    }

    if (payload.isVisible !== undefined) {
        data.isVisible = toBoolean(payload.isVisible, true);
    }

    if (Object.keys(data).length === 0) {
        throw new HttpError(400, "At least one field is required");
    }

    return prisma.resource.update({
        where: { id },
        data,
        include: { platform: true, category: true },
    });
}

async function deleteResource(id) {
    return prisma.resource.delete({ where: { id } });
}

module.exports = {
    listResources,
    getResource,
    createResource,
    updateResource,
    deleteResource,
    listVisibleResourcesByPlatformAndCategory,
    getVisibleResourceByPlatformAndSlug,
};