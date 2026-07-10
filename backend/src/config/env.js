require("dotenv").config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.BACKEND_PORT || process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL || "file:./backend/prisma/dev.db",
  botToken: process.env.BOT_TOKEN || "",
  telegramChannel: process.env.CHANNEL || "",
  youtubeUrl: process.env.YOUTUBE || "",
  channelLink: process.env.CHANNEL_LINK || "",
};