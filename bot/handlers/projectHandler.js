const projectService = require("../services/projectService");
const telegramService = require("../services/telegramService");
const backendClient = require("../services/backendClient");
const commonKeyboard = require("../keyboards/commonKeyboard");

async function handleProjectDeepLink(bot, chatId, msg) {
    const payload = msg.text.split(" ")[1];
    const telegramId = msg.from.id;
    // payload format is "project_<slug>"
    const slug = payload.replace("project_", "");

    try {
        const project = await projectService.getProject(slug);

        if (!project) {
            return bot.sendMessage(chatId, "❌ Project not found.\nThe project may have been removed or the link is invalid.");
        }

        if (!project.isActive) {
            return bot.sendMessage(chatId, "🚫 This project is currently unavailable.");
        }

        // Track View
        await backendClient.request(`/api/projects/${project.id}/view`, { method: "POST" }).catch(console.error);

        await backendClient.setPendingProject(telegramId, project.id);

        const prompt = await backendClient.getVerificationPrompt();
...

        // Project verification screen
        const message = `📦 *${project.title}*\n\n${project.description ? `${project.description}\n\n` : ''}Before downloading complete the following:

✅ Subscribe to our YouTube Channel
✅ Join our Telegram Channel`;

        return bot.sendMessage(chatId, message, {
            parse_mode: "Markdown",
            reply_markup: commonKeyboard.buildVerificationKeyboard({
                youtubeLink: prompt.youtubeLink,
                channelLink: prompt.channelLink,
            }),
        });

    } catch (error) {
        console.error("Project lookup error:", error);
        return bot.sendMessage(chatId, "❌ An error occurred while looking up the project.");
    }
}

module.exports = handleProjectDeepLink;
