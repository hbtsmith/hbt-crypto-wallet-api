-- CreateEnum
CREATE TYPE "public"."DirectionType" AS ENUM ('CROSS_UP', 'CROSS_DOWN');

-- CreateTable
CREATE TABLE "public"."TokenAlert" (
    "id" UUID NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" DECIMAL(20,10) NOT NULL,
    "direction" "public"."DirectionType" NOT NULL,
    "userId" UUID NOT NULL,
    "lastNotificationDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TokenAlert_userId_idx" ON "public"."TokenAlert"("userId");

-- CreateIndex
CREATE INDEX "TokenAlert_symbol_idx" ON "public"."TokenAlert"("symbol");

-- CreateIndex
CREATE INDEX "TokenAlert_active_idx" ON "public"."TokenAlert"("active");

-- AddForeignKey
ALTER TABLE "public"."TokenAlert" ADD CONSTRAINT "TokenAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
