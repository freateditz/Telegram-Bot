const labels = require("../../shared/menuState").labels;

function buildSoftwareKeyboard(os, category, resources) {
    const rows = resources.map((resource) => ([
        {
            text: resource.label,
            callback_data: `resource:${os}:${category}:${resource.key}`,
        },
    ]));

    rows.push([
        {
            text: labels.back,
            callback_data: `back:os:${os}`,
        },
        {
            text: labels.home,
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