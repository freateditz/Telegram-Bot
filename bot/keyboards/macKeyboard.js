const labels = require("../../shared/menuState").labels;

function buildMacKeyboard() {
    return {
        inline_keyboard: [
            [{ text: labels.software, callback_data: "category:mac:software" }],
            [{ text: labels.plugins, callback_data: "category:mac:plugins" }],
            [{ text: labels.presets, callback_data: "category:mac:presets" }],
            [{ text: labels.fonts, callback_data: "category:mac:fonts" }],
            [{ text: labels.soundEffects, callback_data: "category:mac:soundEffects" }],
            [
                { text: labels.back, callback_data: "home" },
                { text: labels.home, callback_data: "home" },
            ],
        ],
    };
}

module.exports = {
    buildMacKeyboard,
};