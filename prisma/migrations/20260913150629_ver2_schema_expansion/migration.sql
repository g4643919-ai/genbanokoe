-- CreateTable
CREATE TABLE "Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "prefectureId" INTEGER,
    "municipalityId" INTEGER,
    "fieldId" INTEGER,
    "serviceTypeId" INTEGER,
    "occupationId" INTEGER,
    "experienceYears" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Profile_prefectureId_fkey" FOREIGN KEY ("prefectureId") REFERENCES "Prefecture" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Profile_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Profile_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Profile_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Profile_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prefecture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Municipality" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prefectureId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    CONSTRAINT "Municipality_prefectureId_fkey" FOREIGN KEY ("prefectureId") REFERENCES "Prefecture" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Field" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fieldId" INTEGER,
    "name" TEXT NOT NULL,
    CONSTRAINT "ServiceType_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Occupation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ObjectiveData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "nightShiftCount" INTEGER,
    "nightShiftHours" INTEGER,
    "nightShiftStaff" INTEGER,
    "assignedResidents" INTEGER,
    "overtimeHours" INTEGER,
    CONSTRAINT "ObjectiveData_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IssueGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postType" TEXT NOT NULL DEFAULT 'ISSUE',
    "industryId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "fieldId" INTEGER,
    "prefectureId" INTEGER,
    "municipalityId" INTEGER,
    "serviceTypeId" INTEGER,
    "occupationId" INTEGER,
    "userId" INTEGER,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "frequency" TEXT,
    "urgency" TEXT,
    "resolutionStatus" TEXT NOT NULL DEFAULT 'UNHANDLED',
    "improvementProposal" TEXT,
    "posterType" TEXT NOT NULL,
    "posterOccupation" TEXT NOT NULL,
    "posterExperienceYears" INTEGER NOT NULL,
    "posterPrefecture" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issueGroupId" INTEGER,
    CONSTRAINT "Post_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Post_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Post_prefectureId_fkey" FOREIGN KEY ("prefectureId") REFERENCES "Prefecture" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Post_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Post_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Post_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Post_issueGroupId_fkey" FOREIGN KEY ("issueGroupId") REFERENCES "IssueGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("categoryId", "content", "createdAt", "id", "industryId", "posterExperienceYears", "posterOccupation", "posterPrefecture", "posterType", "status", "title", "userId") SELECT "categoryId", "content", "createdAt", "id", "industryId", "posterExperienceYears", "posterOccupation", "posterPrefecture", "posterType", "status", "title", "userId" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Prefecture_slug_key" ON "Prefecture"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Municipality_prefectureId_slug_key" ON "Municipality"("prefectureId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Field_slug_key" ON "Field"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ObjectiveData_postId_key" ON "ObjectiveData"("postId");
