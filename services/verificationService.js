const { readUsers, writeUsers } = require("../utils/storage");

function isVerified(userId) {
    const users = readUsers();
    return users[String(userId)] === true;
}

function markVerified(userId) {
    const users = readUsers();
    users[String(userId)] = true;
    writeUsers(users);
    return users;
}

async function isChannelMember(bot, userId) {
    const channel = process.env.CHANNEL;

    if (!channel) {
        return false;
    }

    try {
        const member = await bot.getChatMember(channel, userId);

        return ["member", "administrator", "creator"].includes(member.status);
    } catch (error) {
        console.log("Verification Error:", error.message);
        return false;
    }
}

module.exports = {
    isVerified,
    markVerified,
    isChannelMember,
};