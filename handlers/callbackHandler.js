const { callbackTypes, defaultCategory } = require("../config/constants");
const telegramService = require("../services/telegramService");
const verificationService = require("../services/verificationService");
const handleVerification = require("./verificationHandler");

module.exports = async function handleCallback(bot, query) {
    if (!query || !query.data || !query.message) {
        return;
    }

    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const [action, firstArg, secondArg, thirdArg] = query.data.split(":");

    if (action !== callbackTypes.verify && !verificationService.isVerified(userId)) {
        await bot.answerCallbackQuery(query.id);
        return telegramService.sendVerificationPrompt(bot, chatId);
    }

    switch (action) {
    case callbackTypes.verify:
        return handleVerification(bot, query);

    case callbackTypes.home:
        await bot.answerCallbackQuery(query.id);
        return telegramService.showHome(bot, chatId);

    case callbackTypes.os:
        await bot.answerCallbackQuery(query.id);
        return telegramService.showCategoryMenu(bot, chatId, firstArg);

    case callbackTypes.category:
        await bot.answerCallbackQuery(query.id);
        return telegramService.showSoftwareMenu(bot, chatId, firstArg, secondArg || defaultCategory);

    case callbackTypes.resource:
        await bot.answerCallbackQuery(query.id);
        return telegramService.sendResourceDetails(bot, chatId, firstArg, secondArg || defaultCategory, thirdArg);

    case callbackTypes.back:
        await bot.answerCallbackQuery(query.id);

        if (firstArg === "home") {
            return telegramService.showHome(bot, chatId);
        }

        if (firstArg === "os") {
            return telegramService.showCategoryMenu(bot, chatId, secondArg);
        }

        if (firstArg === "category") {
            return telegramService.showSoftwareMenu(bot, chatId, secondArg, thirdArg || defaultCategory);
        }

        return telegramService.showHome(bot, chatId);

    default:
        await bot.answerCallbackQuery(query.id);
        return null;
    }
};