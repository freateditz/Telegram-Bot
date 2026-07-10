const menus = require("../config/menus");

function buildHomeKeyboard() {
    return {
        inline_keyboard: [
            [
                {
                    text: menus.labels.windows,
                    callback_data: "os:windows",
                },
                {
                    text: menus.labels.mac,
                    callback_data: "os:mac",
                },
            ],
        ],
    };
}

module.exports = {
    buildHomeKeyboard,
};