const labels = require("../../shared/menuState").labels;

function buildWindowsKeyboard() {
    return {
        inline_keyboard: [
            [{ text: labels.software, callback_data: "category:windows:software" }],
            [{ text: labels.plugins, callback_data: "category:windows:plugins" }],
            [{ text: labels.presets, callback_data: "category:windows:presets" }],
            [{ text: labels.fonts, callback_data: "category:windows:fonts" }],
            [{ text: labels.soundEffects, callback_data: "category:windows:soundEffects" }],
            [
                { text: labels.back, callback_data: "home" },
                { text: labels.home, callback_data: "home" },
            ],
        ],
    };
}

module.exports = {
    buildWindowsKeyboard,
};