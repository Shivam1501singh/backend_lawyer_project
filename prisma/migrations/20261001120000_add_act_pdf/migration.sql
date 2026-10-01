-- CreateTable
CREATE TABLE IF NOT EXISTS "ActPdf" (
    "id" TEXT NOT NULL,
    "actId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT DEFAULT 'application/pdf',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActPdf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ActPdf_actId_idx" ON "ActPdf"("actId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ActPdf_displayName_idx" ON "ActPdf"("displayName");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ActPdf_fileName_idx" ON "ActPdf"("fileName");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ActPdf_createdAt_idx" ON "ActPdf"("createdAt");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ActPdf_actId_fkey'
    ) THEN
        ALTER TABLE "ActPdf" ADD CONSTRAINT "ActPdf_actId_fkey" FOREIGN KEY ("actId") REFERENCES "Act"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
