const createApp = require("./app");
const env = require("./config/env");
const { seedDatabase } = require("./database/seedService");

let server;

async function startServer() {
    if (server) {
        return server;
    }

    const app = createApp();
    const port = env.port;

    await seedDatabase();

    return new Promise((resolve) => {
        server = app.listen(port, () => {
            console.log(`✅ Backend running on port ${port}`);
            resolve(server);
        });
    });
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