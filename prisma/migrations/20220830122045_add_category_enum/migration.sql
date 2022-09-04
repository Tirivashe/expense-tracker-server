/*
  Warnings:

  - The `category` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('PRODUCTS', 'ENTERTAINMENT', 'BILLS', 'OTHER');

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "category",
ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'PRODUCTS';
