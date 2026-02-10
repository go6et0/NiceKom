ALTER TABLE "Product"
ALTER COLUMN "advantagesBg" SET DEFAULT ARRAY[]::TEXT[];

UPDATE "Product"
SET "advantagesBg" = ARRAY[]::TEXT[]
WHERE "advantagesBg" IS NULL;

ALTER TABLE "Product"
ALTER COLUMN "advantagesBg" SET NOT NULL;