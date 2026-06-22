/*
  Warnings:

  - You are about to drop the column `responsible` on the `Visit` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('PENDIENTE', 'EN_CURSO', 'RESUELTO');

-- AlterTable
ALTER TABLE "Lot" ADD COLUMN     "supplierId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otpCode" TEXT,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Visit" DROP COLUMN "responsible",
ADD COLUMN     "responsibleId" TEXT,
ADD COLUMN     "status" "VisitStatus" NOT NULL DEFAULT 'PENDIENTE';

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialBatch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "batchNumber" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "receivedDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "supplierId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "RawMaterialBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotIngredient" (
    "id" TEXT NOT NULL,
    "quantityUsed" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "rawMaterialBatchId" TEXT NOT NULL,

    CONSTRAINT "LotIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Supplier_organizationId_idx" ON "Supplier"("organizationId");

-- CreateIndex
CREATE INDEX "RawMaterialBatch_organizationId_idx" ON "RawMaterialBatch"("organizationId");

-- CreateIndex
CREATE INDEX "LotIngredient_lotId_idx" ON "LotIngredient"("lotId");

-- CreateIndex
CREATE INDEX "LotIngredient_rawMaterialBatchId_idx" ON "LotIngredient"("rawMaterialBatchId");

-- CreateIndex
CREATE INDEX "Visit_responsibleId_idx" ON "Visit"("responsibleId");

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialBatch" ADD CONSTRAINT "RawMaterialBatch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialBatch" ADD CONSTRAINT "RawMaterialBatch_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialBatch" ADD CONSTRAINT "RawMaterialBatch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotIngredient" ADD CONSTRAINT "LotIngredient_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotIngredient" ADD CONSTRAINT "LotIngredient_rawMaterialBatchId_fkey" FOREIGN KEY ("rawMaterialBatchId") REFERENCES "RawMaterialBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
