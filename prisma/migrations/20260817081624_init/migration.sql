/*
  Warnings:

  - You are about to drop the column `pincode` on the `Advocate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[barCouncilId]` on the table `Advocate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `barCouncilId` to the `Advocate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Advocate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `Advocate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Advocate" DROP COLUMN "pincode",
ADD COLUMN     "aadhaarNumber" TEXT,
ADD COLUMN     "about" TEXT,
ADD COLUMN     "barCouncilId" TEXT NOT NULL,
ADD COLUMN     "bestPracticeArea" TEXT,
ADD COLUMN     "casesWon" INTEGER,
ADD COLUMN     "completeAddress" TEXT,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "courtPractice" TEXT[],
ADD COLUMN     "experienceYears" INTEGER,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "languagesSpoken" TEXT[],
ADD COLUMN     "offlineVisitingFee" DECIMAL(65,30),
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "practiceArea" TEXT,
ADD COLUMN     "profilePhotoPublicId" TEXT,
ADD COLUMN     "profilePhotoUrl" TEXT,
ADD COLUMN     "videoCallChargePerMinute" DECIMAL(65,30),
ADD COLUMN     "voiceCallChargePerMinute" DECIMAL(65,30),
ALTER COLUMN "emailVerified" SET DEFAULT false,
ALTER COLUMN "phoneVerified" SET DEFAULT false;

-- AlterTable
ALTER TABLE "RegistrationSession" ADD COLUMN     "aadhaarNumber" TEXT,
ADD COLUMN     "barCouncilId" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "languagesSpoken" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "profilePhotoPublicId" TEXT,
ADD COLUMN     "profilePhotoUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Advocate_barCouncilId_key" ON "Advocate"("barCouncilId");
