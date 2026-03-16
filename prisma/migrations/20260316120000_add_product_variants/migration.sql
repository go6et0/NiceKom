-- CreateTable
CREATE TABLE "ProductVariant" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "packageSize" DECIMAL(10,2) NOT NULL,
  "unit" "Unit" NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductVariant_productId_sortOrder_idx" ON "ProductVariant"("productId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill one default variant for existing products
INSERT INTO "ProductVariant" ("id", "productId", "packageSize", "unit", "price", "quantity", "sortOrder", "createdAt", "updatedAt")
SELECT
  CONCAT('pv_', "id"),
  "id",
  "packageSize",
  "unit",
  "price",
  "quantity",
  0,
  NOW(),
  NOW()
FROM "Product";

