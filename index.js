require("dotenv").config();

const { startServer } = require("./backend/src/server");
const { startBot } = require("./bot/bot");

async function bootstrap() {
    await startServer();
    await startBot();
}

bootstrap().catch((error) => {
    console.error("Bootstrap error:", error);
    process.exit(1);
});