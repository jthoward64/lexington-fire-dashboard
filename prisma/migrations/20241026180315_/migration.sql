/*
  Warnings:

  - The primary key for the `apparatus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `apparatus` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_apparatus" (
    "prefix" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "incidentNumber" INTEGER NOT NULL,

    PRIMARY KEY ("prefix", "number"),
    CONSTRAINT "apparatus_incidentNumber_fkey" FOREIGN KEY ("incidentNumber") REFERENCES "incidents" ("number") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_apparatus" ("incidentNumber", "number", "prefix", "status") SELECT "incidentNumber", "number", "prefix", "status" FROM "apparatus";
DROP TABLE "apparatus";
ALTER TABLE "new_apparatus" RENAME TO "apparatus";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
