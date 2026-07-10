const menus = require("../config/menus");

function buildVerificationKeyboard({ youtubeLink, channelLink }) {
    const rows = [];

    if (youtubeLink) {
        rows.push([
            {
                text: menus.labels.subscribe,
                url: youtubeLink,
            },
        ]);
    }

    if (channelLink) {
        rows.push([
            {
                text: menus.labels.join,
                url: channelLink,
            },
        ]);
    }

    rows.push([
        {
            text: menus.labels.verify,
            callback_data: "verify",
        },
    ]);

    return {
        inline_keyboard: rows,
    };
}

function buildNavigationKeyboard(backCallbackData) {
    const rows = [];

    if (backCallbackData) {
        rows.push([
            {
                text: menus.labels.back,
                callback_data: backCallbackData,
            },
        ]);
    }

    rows.push([
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
    buildVerificationKeyboard,
    buildNavigationKeyboard,
};