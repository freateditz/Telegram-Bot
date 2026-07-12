-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Resource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT,
    "platformId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "downloadLink" TEXT,
    "fixLink" TEXT,
    "tutorialChannelId" TEXT,
    "tutorialMessageId" INTEGER,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resource_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Resource_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Resource" ("categoryId", "createdAt", "description", "displayOrder", "downloadLink", "fixLink", "id", "isVisible", "name", "platformId", "slug", "tutorialChannelId", "tutorialMessageId", "updatedAt", "version") SELECT "categoryId", "createdAt", "description", "displayOrder", "downloadLink", "fixLink", "id", "isVisible", "name", "platformId", "slug", "tutorialChannelId", "tutorialMessageId", "updatedAt", "version" FROM "Resource";
DROP TABLE "Resource";
ALTER TABLE "new_Resource" RENAME TO "Resource";
CREATE INDEX "Resource_platformId_idx" ON "Resource"("platformId");
CREATE INDEX "Resource_categoryId_idx" ON "Resource"("categoryId");
CREATE INDEX "Resource_displayOrder_idx" ON "Resource"("displayOrder");
CREATE UNIQUE INDEX "Resource_platformId_slug_key" ON "Resource"("platformId", "slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
