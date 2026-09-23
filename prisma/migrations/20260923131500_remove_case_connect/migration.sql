-- DropForeignKey
ALTER TABLE IF EXISTS "CaseConnection" DROP CONSTRAINT IF EXISTS "CaseConnection_requestId_fkey";
ALTER TABLE IF EXISTS "CaseConnection" DROP CONSTRAINT IF EXISTS "CaseConnection_userId_fkey";
ALTER TABLE IF EXISTS "CaseConnection" DROP CONSTRAINT IF EXISTS "CaseConnection_advocateId_fkey";

ALTER TABLE IF EXISTS "CaseRequestAttachment" DROP CONSTRAINT IF EXISTS "CaseRequestAttachment_requestId_fkey";

ALTER TABLE IF EXISTS "CaseConnectionRequest" DROP CONSTRAINT IF EXISTS "CaseConnectionRequest_userId_fkey";
ALTER TABLE IF EXISTS "CaseConnectionRequest" DROP CONSTRAINT IF EXISTS "CaseConnectionRequest_advocateId_fkey";

-- DropTable
DROP TABLE IF EXISTS "CaseConnection";
DROP TABLE IF EXISTS "CaseRequestAttachment";
DROP TABLE IF EXISTS "CaseConnectionRequest";

-- DropEnum
DROP TYPE IF EXISTS "RequestStatus";
