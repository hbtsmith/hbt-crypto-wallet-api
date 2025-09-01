/*
  Warnings:

  - You are about to drop the column `acquiredAt` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Token` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."Token" DROP COLUMN "acquiredAt",
DROP COLUMN "amount",
DROP COLUMN "notes",
DROP COLUMN "price",
ADD COLUMN     "userId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "public"."TokenBalance" (
    "id" UUID NOT NULL,
    "price" DECIMAL(20,10) NOT NULL,
    "amount" DECIMAL(36,18) NOT NULL,
    "operationAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "operationType" TEXT NOT NULL,
    "tokenId" UUID NOT NULL,

    CONSTRAINT "TokenBalance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TokenBalance" ADD CONSTRAINT "TokenBalance_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "public"."Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
