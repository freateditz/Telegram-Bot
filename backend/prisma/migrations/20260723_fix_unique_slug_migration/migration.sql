ALTER TABLE "Resource" ALTER COLUMN "slug" DROP NOT NULL;
ALTER TABLE "Resource" DROP CONSTRAINT IF EXISTS "Resource_platformId_slug_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Resource_slug_key" ON "Resource"("slug");
