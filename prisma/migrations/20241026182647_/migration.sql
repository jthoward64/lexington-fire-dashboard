/*
  Warnings:

  - The primary key for the `apparatusAssignment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `apparatusAssignment` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_apparatusAssignment" (
    "status" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "lastUpdate" DATETIME NOT NULL,
    "apparatusPrefix" TEXT NOT NULL,
    "apparatusNumber" TEXT NOT NULL,
    "incidentsNumber" INTEGER NOT NULL,

    PRIMARY KEY ("apparatusPrefix", "apparatusNumber", "incidentsNumber"),
    CONSTRAINT "apparatusAssignment_apparatusPrefix_apparatusNumber_fkey" FOREIGN KEY ("apparatusPrefix", "apparatusNumber") REFERENCES "apparatus" ("prefix", "number") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "apparatusAssignment_incidentsNumber_fkey" FOREIGN KEY ("incidentsNumber") REFERENCES "incidents" ("number") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_apparatusAssignment" ("active", "apparatusNumber", "apparatusPrefix", "incidentsNumber", "lastUpdate", "status") SELECT "active", "apparatusNumber", "apparatusPrefix", "incidentsNumber", "lastUpdate", "status" FROM "apparatusAssignment";
DROP TABLE "apparatusAssignment";
ALTER TABLE "new_apparatusAssignment" RENAME TO "apparatusAssignment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
