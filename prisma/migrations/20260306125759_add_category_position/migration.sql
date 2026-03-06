-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Category_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("id", "name", "serverId") SELECT "id", "name", "serverId" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
