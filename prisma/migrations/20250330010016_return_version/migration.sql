/*
  Warnings:

  - You are about to drop the column `ID_AREA` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ID_BRANCH` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ID_ROLE` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Area` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Branch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpenseDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpenseRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Area` DROP FOREIGN KEY `Area_ID_BRANCH_fkey`;

-- DropForeignKey
ALTER TABLE `Branch` DROP FOREIGN KEY `Branch_ID_COMPANY_fkey`;

-- DropForeignKey
ALTER TABLE `ExpenseDetail` DROP FOREIGN KEY `ExpenseDetail_ID_EXPENSE_REQUEST_fkey`;

-- DropForeignKey
ALTER TABLE `ExpenseRequest` DROP FOREIGN KEY `ExpenseRequest_ID_USER_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_ID_AREA_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_ID_BRANCH_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_ID_ROLE_fkey`;

-- DropIndex
DROP INDEX `User_ID_AREA_fkey` ON `User`;

-- DropIndex
DROP INDEX `User_ID_BRANCH_fkey` ON `User`;

-- DropIndex
DROP INDEX `User_ID_ROLE_fkey` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `ID_AREA`,
    DROP COLUMN `ID_BRANCH`,
    DROP COLUMN `ID_ROLE`;

-- DropTable
DROP TABLE `Area`;

-- DropTable
DROP TABLE `Branch`;

-- DropTable
DROP TABLE `ExpenseDetail`;

-- DropTable
DROP TABLE `ExpenseRequest`;

-- DropTable
DROP TABLE `Role`;
