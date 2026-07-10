const menus = require("../config/menus");

function buildSoftwareKeyboard(os, category, resources) {
    const rows = resources.map((resource) => ([
        {
            text: resource.label,
            callback_data: `resource:${os}:${category}:${resource.key}`,
        },
    ]));

    rows.push([
        {
            text: menus.labels.back,
            callback_data: `back:os:${os}`,
        },
        {
            text: menus.labels.home,
            callback_data: "home",
        },
    ]);

    return {
        inline_keyboard: rows,
    };
}

module.exports = {
    buildSoftwareKeyboard,
};