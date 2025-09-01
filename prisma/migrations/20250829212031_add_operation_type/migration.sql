/*
  Warnings:

  - Changed the type of `operationType` on the `TokenBalance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."OperationType" AS ENUM ('BUY', 'SELL');

-- AlterTable
ALTER TABLE "public"."TokenBalance" DROP COLUMN "operationType",
ADD COLUMN     "operationType" "public"."OperationType" NOT NULL;
