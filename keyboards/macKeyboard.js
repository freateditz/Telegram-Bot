const menus = require("../config/menus");

function buildMacKeyboard() {
    return {
        inline_keyboard: [
            [
                {
                    text: menus.labels.software,
                    callback_data: "category:mac:software",
                },
            ],
            [
                {
                    text: menus.labels.plugins,
                    callback_data: "category:mac:plugins",
                },
            ],
            [
                {
                    text: menus.labels.presets,
                    callback_data: "category:mac:presets",
                },
            ],
            [
                {
                    text: menus.labels.fonts,
                    callback_data: "category:mac:fonts",
                },
            ],
            [
                {
                    text: menus.labels.soundEffects,
                    callback_data: "category:mac:soundEffects",
                },
            ],
            [
                {
                    text: menus.labels.back,
                    callback_data: "home",
                },
                {
                    text: menus.labels.home,
                    callback_data: "home",
                },
            ],
        ],
    };
}

module.exports = {
    buildMacKeyboard,
};