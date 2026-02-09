-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "customerEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "customerName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "customerPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';
