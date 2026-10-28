const labels = require("../../shared/menuState").labels;

function normalizeUrl(raw) {
    if (!raw) return null;
    let url = String(raw).trim();
    if (!url) return null;
    if (url.startsWith("@")) {
        return `https://t.me/${url.slice(1)}`;
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return `https://${url}`;
    }
    return url;
}

function buildVerificationKeyboard({ youtubeLink, channelLink }) {
    const rows = [];

    const validYoutube = normalizeUrl(youtubeLink);
    if (validYoutube) {
        rows.push([
            {
                text: labels.subscribe,
                url: validYoutube,
            },
        ]);
    }

    const validChannel = normalizeUrl(channelLink);
    if (validChannel) {
        rows.push([
            {
                text: labels.join,
                url: validChannel,
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