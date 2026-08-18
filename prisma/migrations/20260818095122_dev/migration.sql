/*
  Warnings:

  - You are about to drop the column `practiceArea` on the `Advocate` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "HelpRequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- AlterTable
ALTER TABLE "Advocate" DROP COLUMN "practiceArea",
ADD COLUMN     "averageRating" DECIMAL(65,30),
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "country" DROP NOT NULL;

-- CreateTable
CREATE TABLE "HelpRequest" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL DEFAULT '',
    "concern" TEXT NOT NULL,
    "response" TEXT,
    "status" "HelpRequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "HelpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "advocateId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HelpRequest_referenceId_key" ON "HelpRequest"("referenceId");

-- CreateIndex
CREATE INDEX "HelpRequest_email_idx" ON "HelpRequest"("email");

-- CreateIndex
CREATE INDEX "HelpRequest_phoneNumber_idx" ON "HelpRequest"("phoneNumber");

-- CreateIndex
CREATE INDEX "HelpRequest_status_idx" ON "HelpRequest"("status");

-- CreateIndex
CREATE INDEX "HelpRequest_createdAt_idx" ON "HelpRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Review_advocateId_idx" ON "Review"("advocateId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_advocateId_key" ON "Review"("userId", "advocateId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_advocateId_fkey" FOREIGN KEY ("advocateId") REFERENCES "Advocate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
