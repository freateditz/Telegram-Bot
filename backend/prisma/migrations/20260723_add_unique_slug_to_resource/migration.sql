ALTER TABLE "Resource" ALTER COLUMN "slug" DROP NOT NULL;
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_platformId_slug_key";
CREATE UNIQUE INDEX "Resource_slug_key" ON "Resource"("slug");
