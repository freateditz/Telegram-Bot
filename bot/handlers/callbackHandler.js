const { callbackTypes } = require("../../shared/menuState");
const backendClient = require("../services/backendClient");
const telegramService = require("../services/telegramService");
const handleVerification = require("./verificationHandler");

module.exports = async function handleCallback(bot, query) {
    if (!query || !query.data || !query.message) {
        return;
    }

    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const [action, firstArg, secondArg, thirdArg] = query.data.split(":");

    if (action !== callbackTypes.verify) {
        const state = await backendClient.getVerificationStatus(userId);

        if (!state.verified) {
            await bot.answerCallbackQuery(query.id);
            const prompt = await backendClient.getVerificationPrompt();
            return telegramService.sendVerificationPrompt(bot, chatId, prompt);
        }
    }

    switch (action) {
    case callbackTypes.verify:
        return handleVerification(bot, query);

    case callbackTypes.home:
        await bot.answerCallbackQuery(query.id);
        return telegramService.showHome(bot, chatId, backendClient, query);

    case callbackTypes.platform:
        await bot.answerCallbackQuery(query.id);
        return telegramService.showCategoryMenu(bot, chatId, firstArg, backendClient, query);

    case callbackTypes.category:
        await bot.answerCallbackQuery(query.id);
        return telegramService.showResourceMenu(bot, chatId, firstArg, secondArg, backendClient, query);

    case callbackTypes.resource:
        await bot.answerCallbackQuery(query.id);
        return telegramService.sendResourceDetails(bot, chatId, firstArg, secondArg, backendClient, query);

    case callbackTypes.tutorial:
        await bot.answerCallbackQuery(query.id);
        // format: tutorial:channelId:messageId -> firstArg is channelId, secondArg is messageId
        return telegramService.sendTutorial(bot, chatId, firstArg, secondArg);

    case callbackTypes.back:
        await bot.answerCallbackQuery(query.id);

        if (firstArg === "home") {
            return telegramService.showHome(bot, chatId, backendClient, query);
        }

        if (firstArg === "platform") {
            return telegramService.showCategoryMenu(bot, chatId, secondArg, backendClient, query);
        }

        if (firstArg === "category") {
            return telegramService.showResourceMenu(bot, chatId, secondArg, thirdArg, backendClient, query);
        }

        return telegramService.showHome(bot, chatId, backendClient, query);

    default:
        await bot.answerCallbackQuery(query.id);
        return null;
    }
};