const labels = require("../../shared/menuState").labels;

function buildHomeKeyboard() {
    return {
        inline_keyboard: [
            [
                {
                    text: labels.windows,
                    callback_data: "os:windows",
                },
                {
                    text: labels.mac,
                    callback_data: "os:mac",
                },
            ],
        ],
    };
}

module.exports = {
    buildHomeKeyboard,
};