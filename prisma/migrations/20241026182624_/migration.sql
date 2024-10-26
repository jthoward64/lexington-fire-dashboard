/*
  Warnings:

  - You are about to drop the column `loadId` on the `incidents` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_incidents" (
    "number" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "parsedCode" TEXT,
    "alarm" INTEGER NOT NULL,
    "enroute" TEXT,
    "arrive" TEXT,
    "address" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "lastUpdate" DATETIME NOT NULL
);
INSERT INTO "new_incidents" ("active", "address", "alarm", "arrive", "code", "enroute", "lastUpdate", "number", "parsedCode") SELECT "active", "address", "alarm", "arrive", "code", "enroute", "lastUpdate", "number", "parsedCode" FROM "incidents";
DROP TABLE "incidents";
ALTER TABLE "new_incidents" RENAME TO "incidents";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
