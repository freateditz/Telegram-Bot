const createApp = require("./app");
const env = require("./config/env");
const { seedDatabase } = require("./database/seedService");
const { startBot } = require("../../bot/bot");

let server;

async function startServer() {
    if (server) {
        return server;
    }

    const app = createApp();
    const port = env.port;

    // Start listening immediately
    server = app.listen(port, () => {
        console.log(`✅ Backend listening on port ${port}`);
    });

    // Run startup tasks in background
    (async () => {
        try {
            console.log("🚀 Starting background startup tasks...");
            await seedDatabase();
            await startBot();
            console.log("✅ Background startup tasks completed");
        } catch (error) {
            console.error("❌ Background startup tasks failed:", error);
        }
    })();

    return server;
}

if (require.main === module) {
    startServer().catch((error) => {
        console.error("Backend failed to start:", error);
        process.exit(1);
    });
}

module.exports = {
    startServer,
};