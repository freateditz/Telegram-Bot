const prisma = require("./prisma");

/**
 * One-time settings-key migration.
 *
 * History: the dashboard used to save settings under the keys
 *   - "youtube"
 *   - "telegram"
 *   - "support"
 * while the bot / backend read canonical keys
 *   - "youtubeLink"
 *   - "channelLink"
 *   - "supportLink"
 * This produced duplicate rows in the `Setting` table and the bot kept
 * reading the stale canonical values.
 *
 * This migration is idempotent and safe to re-run on every backend
 * start: for each legacy key
 *   1. read its current value
 *   2. if the canonical key is empty/missing, copy the value over
 *   3. delete the legacy row
 * If the canonical row already has a value we leave it alone and just
 * remove the duplicate (the canonical value is the source of truth).
 */
const LEGACY_TO_CANONICAL = [
  { legacy: "telegram", canonical: "channelLink" },
  { legacy: "youtube", canonical: "youtubeLink" },
  { legacy: "support", canonical: "supportLink" },
];

async function migrateSettingKey(legacyKey, canonicalKey) {
  const legacy = await prisma.setting.findUnique({ where: { key: legacyKey } });

  if (!legacy) {
    return { migrated: false, reason: "no legacy row" };
  }

  const canonical = await prisma.setting.findUnique({ where: { key: canonicalKey } });
  const legacyValue = (legacy.value || "").trim();
  const canonicalValue = (canonical?.value || "").trim();

  // Decision matrix:
  //   - legacy has a value            -> overwrite canonical with legacy.
  //                                    The legacy row was written by the
  //                                    most recent dashboard save, so it
  //                                    represents the operator's intent.
  //   - legacy empty, canonical set   -> keep canonical, drop legacy.
  //   - legacy empty, no canonical    -> create an empty canonical row.
  //   - no legacy row                 -> nothing to do (handled above).
  if (legacyValue) {
    if (canonical) {
      await prisma.setting.update({
        where: { key: canonicalKey },
        data: { value: legacyValue },
      });
    } else {
      await prisma.setting.create({
        data: { key: canonicalKey, value: legacyValue },
      });
    }
  } else if (!canonical) {
    await prisma.setting.create({
      data: { key: canonicalKey, value: "" },
    });
  }

  await prisma.setting.delete({ where: { key: legacyKey } });

  return {
    migrated: true,
    finalValue: legacyValue || canonicalValue,
    legacyWasEmpty: !legacyValue,
  };
}

async function migrateLegacySettings() {
  const results = [];

  for (const { legacy, canonical } of LEGACY_TO_CANONICAL) {
    const result = await migrateSettingKey(legacy, canonical);
    results.push({ legacy, canonical, ...result });
  }

  return results;
}

module.exports = {
  migrateLegacySettings,
  LEGACY_TO_CANONICAL,
};
