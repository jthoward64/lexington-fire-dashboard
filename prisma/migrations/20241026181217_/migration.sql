/*
  Warnings:

  - You are about to drop the `loads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `incidentNumber` on the `apparatus` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `apparatus` table. All the data in the column will be lost.
  - Added the required column `lastSeen` to the `apparatus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `active` to the `incidents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdate` to the `incidents` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "loads";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "apparatusAssignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "lastUpdate" DATETIME NOT NULL,
    "apparatusPrefix" TEXT NOT NULL,
    "apparatusNumber" TEXT NOT NULL,
    "incidentsNumber" INTEGER NOT NULL,
    CONSTRAINT "apparatusAssignment_apparatusPrefix_apparatusNumber_fkey" FOREIGN KEY ("apparatusPrefix", "apparatusNumber") REFERENCES "apparatus" ("prefix", "number") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "apparatusAssignment_incidentsNumber_fkey" FOREIGN KEY ("incidentsNumber") REFERENCES "incidents" ("number") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_apparatus" (
    "prefix" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "lastSeen" DATETIME NOT NULL,
    "incidentsNumber" INTEGER,

    PRIMARY KEY ("prefix", "number")
);
INSERT INTO "new_apparatus" ("number", "prefix") SELECT "number", "prefix" FROM "apparatus";
DROP TABLE "apparatus";
ALTER TABLE "new_apparatus" RENAME TO "apparatus";
CREATE TABLE "new_incidents" (
    "number" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "parsedCode" TEXT,
    "alarm" INTEGER NOT NULL,
    "enroute" TEXT,
    "arrive" TEXT,
    "address" TEXT NOT NULL,
    "loadId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "lastUpdate" DATETIME NOT NULL
);
INSERT INTO "new_incidents" ("address", "alarm", "arrive", "code", "enroute", "loadId", "number", "parsedCode") SELECT "address", "alarm", "arrive", "code", "enroute", "loadId", "number", "parsedCode" FROM "incidents";
DROP TABLE "incidents";
ALTER TABLE "new_incidents" RENAME TO "incidents";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
