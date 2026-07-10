const env = require("../src/config/env");
const { seedDatabase } = require("../src/database/seedService");

async function main() {
  void env;
  await seedDatabase();
  console.log("✅ Prisma seed completed");
}

main().catch((error) => {
  console.error("Prisma seed failed:", error);
  process.exit(1);
});