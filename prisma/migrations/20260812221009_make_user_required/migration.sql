/*
  Warnings:

  - Made the column `userId` on table `DailyCheckIn` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `DailyReflection` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Note` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DailyCheckIn" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "DailyReflection" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "userId" SET NOT NULL;
