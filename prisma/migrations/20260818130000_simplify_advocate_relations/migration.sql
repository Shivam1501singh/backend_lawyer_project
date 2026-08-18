-- 1. AlterTable to add new columns
ALTER TABLE "Advocate" ADD COLUMN IF NOT EXISTS "practiceAreas" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Advocate" ADD COLUMN IF NOT EXISTS "topCourtPractised" TEXT;

-- 2. Migrate topCourtPractised from Court table joins
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Court') THEN
    UPDATE "Advocate" a
    SET "topCourtPractised" = c.name
    FROM "Court" c
    WHERE a."topCourtPractisedId" = c.id;
  END IF;
END $$;

-- 3. Migrate practiceAreas from many-to-many relationship table
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_AdvocateToPracticeArea') AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'PracticeArea') THEN
    EXECUTE 'WITH aggregated_areas AS (
      SELECT j."A" AS advocate_id, array_agg(p.name) AS areas
      FROM "_AdvocateToPracticeArea" j
      JOIN "PracticeArea" p ON j."B" = p.id
      GROUP BY j."A"
    )
    UPDATE "Advocate" a
    SET "practiceAreas" = aa.areas
    FROM aggregated_areas aa
    WHERE a.id = aa.advocate_id';
  END IF;
END $$;

-- 4. Drop foreign keys and drop unused tables / indexes
ALTER TABLE "Advocate" DROP CONSTRAINT IF EXISTS "Advocate_topCourtPractisedId_fkey";

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_AdvocateToPracticeArea') THEN
    ALTER TABLE "_AdvocateToPracticeArea" DROP CONSTRAINT IF EXISTS "_AdvocateToPracticeArea_A_fkey";
    ALTER TABLE "_AdvocateToPracticeArea" DROP CONSTRAINT IF EXISTS "_AdvocateToPracticeArea_B_fkey";
  END IF;
END $$;

DROP INDEX IF EXISTS "Advocate_topCourtPractisedId_idx";

ALTER TABLE "Advocate" DROP COLUMN IF EXISTS "topCourtPractisedId";

DROP TABLE IF EXISTS "Court" CASCADE;
DROP TABLE IF EXISTS "PracticeArea" CASCADE;
DROP TABLE IF EXISTS "_AdvocateToPracticeArea" CASCADE;

