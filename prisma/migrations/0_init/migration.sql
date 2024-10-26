-- CreateTable
CREATE TABLE "apparatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prefix" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "incidentNumber" INTEGER NOT NULL,
    CONSTRAINT "apparatus_incidentNumber_fkey" FOREIGN KEY ("incidentNumber") REFERENCES "incidents" ("number") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "incidents" (
    "number" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "parsedCode" TEXT,
    "alarm" INTEGER NOT NULL,
    "enroute" TEXT,
    "arrive" TEXT,
    "address" TEXT NOT NULL,
    "loadId" INTEGER NOT NULL,
    CONSTRAINT "incidents_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "loads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "loads" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" INTEGER
);

