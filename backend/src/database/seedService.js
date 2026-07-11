const prisma = require("./prisma");
const seedData = require("./seedData");
const { loadLegacyVerifiedUsers } = require("./legacyUsers");
const { migrateLegacySettings } = require("./settingsMigration");

async function seedPlatforms() {
  for (const platform of seedData.platforms) {
    await prisma.platform.upsert({
      where: { slug: platform.slug },
      create: platform,
      update: { name: platform.name },
    });
  }
}

async function seedCategories() {
  for (const category of seedData.categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: {
        name: category.name,
        displayOrder: category.displayOrder,
      },
    });
  }
}

async function seedResources() {
  for (const resource of seedData.resources) {
    const platform = await prisma.platform.findUnique({ where: { slug: resource.platformSlug } });
    const category = await prisma.category.findUnique({ where: { slug: resource.categorySlug } });

    if (!platform || !category) {
      continue;
    }

    const { platformSlug, categorySlug, ...resourceData } = resource;

    await prisma.resource.upsert({
      where: {
  platformId_slug: {
    platformId: platform.id,
    slug: resourceData.slug,
  },
},
      create: {
        ...resourceData,
        platformId: platform.id,
        categoryId: category.id,
      },
      update: {
        ...resourceData,
        platformId: platform.id,
        categoryId: category.id,
      },
    });
  }
}

async function seedSettings() {
  for (const setting of seedData.settings) {
    if (!setting.value) {
      continue;
    }

    await prisma.setting.upsert({
      where: { key: setting.key },
      create: setting,
      update: { value: setting.value },
    });
  }
}

async function seedLegacyUsers() {
  const legacyUsers = loadLegacyVerifiedUsers();

  for (const [telegramId, verified] of Object.entries(legacyUsers)) {
    await prisma.user.upsert({
      where: { telegramId },
      create: { telegramId, verified: Boolean(verified) },
      update: { verified: Boolean(verified) },
    });
  }
}

async function seedDatabase() {
  // Migrate any legacy dashboard-saved keys (youtube/telegram/support)
  // into the canonical keys (youtubeLink/channelLink/supportLink) the
  // bot actually reads. Runs before the seeder so the seed doesn't
  // have to think about legacy state.
  await migrateLegacySettings();

  await seedPlatforms();
  await seedCategories();
  await seedResources();
  await seedSettings();
  await seedLegacyUsers();
}

module.exports = {
  seedDatabase,
};