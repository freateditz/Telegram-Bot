/*
  Warnings:

  - A unique constraint covering the columns `[platformId,slug]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Resource_slug_key";

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN "description" TEXT;
ALTER TABLE "Resource" ADD COLUMN "version" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Resource_platformId_slug_key" ON "Resource"("platformId", "slug");
