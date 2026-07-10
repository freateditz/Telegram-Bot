const menus = require("../config/menus");

function buildWindowsKeyboard() {
    return {
        inline_keyboard: [
            [
                {
                    text: menus.labels.software,
                    callback_data: "category:windows:software",
                },
            ],
            [
                {
                    text: menus.labels.plugins,
                    callback_data: "category:windows:plugins",
                },
            ],
            [
                {
                    text: menus.labels.presets,
                    callback_data: "category:windows:presets",
                },
            ],
            [
                {
                    text: menus.labels.fonts,
                    callback_data: "category:windows:fonts",
                },
            ],
            [
                {
                    text: menus.labels.soundEffects,
                    callback_data: "category:windows:soundEffects",
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
    buildWindowsKeyboard,
};