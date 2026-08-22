-- AlterTable
ALTER TABLE "RegistrationSession" ADD COLUMN IF NOT EXISTS "aadhaarVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RegistrationSession" ADD COLUMN IF NOT EXISTS "aadhaarVerificationAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "RegistrationSession" ADD COLUMN IF NOT EXISTS "aadhaarBlockedUntil" TIMESTAMP(3);
ALTER TABLE "RegistrationSession" ADD COLUMN IF NOT EXISTS "aadhaarVerificationId" TEXT;
ALTER TABLE "RegistrationSession" ADD COLUMN IF NOT EXISTS "aadhaarVerifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Advocate" ADD COLUMN IF NOT EXISTS "aadhaarVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Advocate" ADD COLUMN IF NOT EXISTS "aadhaarVerificationAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Advocate" ADD COLUMN IF NOT EXISTS "aadhaarBlockedUntil" TIMESTAMP(3);
ALTER TABLE "Advocate" ADD COLUMN IF NOT EXISTS "aadhaarVerificationId" TEXT;
ALTER TABLE "Advocate" ADD COLUMN IF NOT EXISTS "aadhaarVerifiedAt" TIMESTAMP(3);
