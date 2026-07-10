const labels = require("../../shared/menuState").labels;

function buildVerificationKeyboard({ youtubeLink, channelLink }) {
    const rows = [];

    if (youtubeLink) {
        rows.push([
            {
                text: labels.subscribe,
                url: youtubeLink,
            },
        ]);
    }

    if (channelLink) {
        rows.push([
            {
                text: labels.join,
                url: channelLink,
            },
        ]);
    }

    rows.push([
        {
            text: labels.verify,
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
                text: labels.back,
                callback_data: backCallbackData,
            },
        ]);
    }

    rows.push([
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
    buildVerificationKeyboard,
    buildNavigationKeyboard,
};