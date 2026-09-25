-- AlterTable
ALTER TABLE "IPCSection" ADD COLUMN IF NOT EXISTS "sectionOrder" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "BNSSection" ADD COLUMN IF NOT EXISTS "sectionOrder" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IPCSection_sectionOrder_idx" ON "IPCSection"("sectionOrder");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BNSSection_sectionOrder_idx" ON "BNSSection"("sectionOrder");
