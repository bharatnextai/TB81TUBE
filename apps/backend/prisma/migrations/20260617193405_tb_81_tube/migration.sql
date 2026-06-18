/*
  Warnings:

  - A unique constraint covering the columns `[userId,platform,platformUserId]` on the table `ConnectedAccount` will be added. If there are existing duplicate values, this will fail.
  - Made the column `platformUserId` on table `ConnectedAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "ConnectedAccount_userId_platform_key";

-- DropIndex
DROP INDEX "ContentItem_title_idx";

-- AlterTable
ALTER TABLE "ConnectedAccount" ALTER COLUMN "platformUserId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ConnectedAccount_userId_idx" ON "ConnectedAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedAccount_userId_platform_platformUserId_key" ON "ConnectedAccount"("userId", "platform", "platformUserId");
