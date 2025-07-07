/*
  Warnings:

  - You are about to drop the column `comprobacionId` on the `MovimientosComprobados` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `MovimientosComprobados` table. All the data in the column will be lost.
  - You are about to drop the column `fechaComprobacion` on the `MovimientosComprobados` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `MovimientosComprobados` DROP FOREIGN KEY `MovimientosComprobados_comprobacionId_fkey`;

-- DropIndex
DROP INDEX `MovimientosComprobados_comprobacionId_fkey` ON `MovimientosComprobados`;

-- AlterTable
ALTER TABLE `MovimientosComprobados` DROP COLUMN `comprobacionId`,
    DROP COLUMN `estado`,
    DROP COLUMN `fechaComprobacion`;
