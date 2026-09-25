-- AlterTable
ALTER TABLE "ActSection" ADD COLUMN IF NOT EXISTS "sectionOrder" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ActSection_sectionOrder_idx" ON "ActSection"("sectionOrder");
