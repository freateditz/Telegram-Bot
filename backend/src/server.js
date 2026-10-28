const createApp = require("./app");
const env = require("./config/env");
const { seedDatabase } = require("./database/seedService");
const { startBot, stopBot } = require("../../bot/bot");

let server;

async function startServer() {
    if (server) {
        return server;
    }

    const app = createApp();
    const port = env.port;

    // Start listening immediately on 0.0.0.0 for container compatibility
    server = app.listen(port, "0.0.0.0", () => {
        console.log(`✅ Backend listening on port ${port}`);
    });

    // Run startup tasks in background independently
    (async () => {
        console.log("🚀 Starting background startup tasks...");

        // 1. Database seeding (does not crash or block bot if it fails)
        try {
            await seedDatabase();
            console.log("✅ Database seeded successfully");
        } catch (dbError) {
            console.error("⚠️ Database seeding encountered an error:", dbError.message || dbError);
        }

        // 2. Start Telegram Bot if BOT_TOKEN is configured
        if (process.env.BOT_TOKEN && process.env.BOT_TOKEN.trim()) {
            try {
                await startBot();
            } catch (botError) {
                console.error("❌ Telegram Bot failed to start:", botError.message || botError);
            }
        } else {
            console.log("ℹ️ BOT_TOKEN not set or empty, skipping Telegram Bot startup");
        }

        console.log("✅ Background startup tasks completed");
    })();

    return server;
}

async function gracefulShutdown(signal) {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
    try {
        await stopBot();
    } catch (err) {
        console.error("Error stopping bot during shutdown:", err.message);
    }

    if (server) {
        server.close(() => {
            console.log("✅ HTTP server closed cleanly");
            process.exit(0);
        });

        // Force exit after 10s if connections do not close in time
        setTimeout(() => {
            console.error("⚠️ Forcing shutdown after timeout");
            process.exit(1);
        }, 10000).unref();
    } else {
        process.exit(0);
    }
}

process.on("unhandledRejection", (reason) => {
    const msg = reason?.message || reason;
    console.warn("⚠️ Unhandled error caught (process preserved):", typeof msg === "string" ? msg : "Request rejected");
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

if (require.main === module) {
    startServer().catch((error) => {
        console.error("Backend failed to start:", error);
        process.exit(1);
    });
}

module.exports = {
    startServer,
};