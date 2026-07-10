const labels = require("../../shared/menuState").labels;

function buildPlatformKeyboard(platforms) {
    return {
        inline_keyboard: [
            ...platforms.map((platform) => ([
                {
                    text: platform.name,
                    callback_data: `platform:${platform.slug}`,
                },
            ])),
        ],
    };
}

function buildCategoryKeyboard(platformSlug, categories) {
    return {
        inline_keyboard: [
            ...categories.map((category) => ([
                {
                    text: category.name,
                    callback_data: `category:${platformSlug}:${category.slug}`,
                },
            ])),
            [
                {
                    text: labels.back,
                    callback_data: "back:home",
                },
                {
                    text: labels.home,
                    callback_data: "home",
                },
            ],
        ],
    };
}

function buildResourceKeyboard(platformSlug, categorySlug, resources) {
    return {
        inline_keyboard: [
            ...resources.map((resource) => ([
                {
                    text: resource.name,
                    callback_data: `resource:${platformSlug}:${resource.slug}`,
                },
            ])),
            [
                {
                    text: labels.back,
                    callback_data: `back:platform:${platformSlug}`,
                },
                {
                    text: labels.home,
                    callback_data: "home",
                },
            ],
        ],
    };
}

function buildResourceDetailsKeyboard(platformSlug, categorySlug) {
    return {
        inline_keyboard: [
            [
                {
                    text: labels.back,
                    callback_data: `back:category:${platformSlug}:${categorySlug}`,
                },
                {
                    text: labels.home,
                    callback_data: "home",
                },
            ],
        ],
    };
}

module.exports = {
    buildPlatformKeyboard,
    buildCategoryKeyboard,
    buildResourceKeyboard,
    buildResourceDetailsKeyboard,
};