-- 1. AlterTable to add new columns
ALTER TABLE "Advocate" ADD COLUMN "practiceAreas" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Advocate" ADD COLUMN "topCourtPractised" TEXT;

-- 2. Migrate topCourtPractised from Court table joins
UPDATE "Advocate" a
SET "topCourtPractised" = c.name
FROM "Court" c
WHERE a."topCourtPractisedId" = c.id;

-- 3. Migrate practiceAreas from many-to-many relationship table
WITH aggregated_areas AS (
  SELECT j."A" AS advocate_id, array_agg(p.name) AS areas
  FROM "_AdvocateToPracticeArea" j
  JOIN "PracticeArea" p ON j."B" = p.id
  GROUP BY j."A"
)
UPDATE "Advocate" a
SET "practiceAreas" = aa.areas
FROM aggregated_areas aa
WHERE a.id = aa.advocate_id;

-- 4. Drop foreign keys and drop unused tables / indexes
ALTER TABLE "Advocate" DROP CONSTRAINT IF EXISTS "Advocate_topCourtPractisedId_fkey";
ALTER TABLE "_AdvocateToPracticeArea" DROP CONSTRAINT IF EXISTS "_AdvocateToPracticeArea_A_fkey";
ALTER TABLE "_AdvocateToPracticeArea" DROP CONSTRAINT IF EXISTS "_AdvocateToPracticeArea_B_fkey";

DROP INDEX IF EXISTS "Advocate_topCourtPractisedId_idx";

ALTER TABLE "Advocate" DROP COLUMN IF EXISTS "topCourtPractisedId";

DROP TABLE IF EXISTS "Court" CASCADE;
DROP TABLE IF EXISTS "PracticeArea" CASCADE;
DROP TABLE IF EXISTS "_AdvocateToPracticeArea" CASCADE;
