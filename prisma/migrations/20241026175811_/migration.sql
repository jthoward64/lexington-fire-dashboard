/*
  Warnings:

  - You are about to alter the column `timestamp` on the `loads` table. The data in that column could be lost. The data in that column will be cast from `Int` to `DateTime`.
  - Made the column `timestamp` on table `loads` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_loads" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL
);
INSERT INTO "new_loads" ("id", "timestamp") SELECT "id", "timestamp" FROM "loads";
DROP TABLE "loads";
ALTER TABLE "new_loads" RENAME TO "loads";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
