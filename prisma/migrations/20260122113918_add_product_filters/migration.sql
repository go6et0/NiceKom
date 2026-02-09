-- CreateEnum
CREATE TYPE "BaseOil" AS ENUM ('MINERAL', 'SEMI_SYNTHETIC', 'SYNTHETIC');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "application" TEXT,
ADD COLUMN     "baseOil" "BaseOil",
ADD COLUMN     "certification" TEXT,
ADD COLUMN     "operatingTempMax" INTEGER,
ADD COLUMN     "operatingTempMin" INTEGER;
