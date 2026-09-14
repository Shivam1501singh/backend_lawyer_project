-- CreateTable
CREATE TABLE IF NOT EXISTS "ErrorLog" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT,
    "statusCode" INTEGER NOT NULL DEFAULT 500,
    "errorName" TEXT,
    "errorMessage" TEXT NOT NULL,
    "errorStack" TEXT,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "userId" TEXT,
    "userType" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ErrorLog_statusCode_idx" ON "ErrorLog"("statusCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ErrorLog_method_idx" ON "ErrorLog"("method");
