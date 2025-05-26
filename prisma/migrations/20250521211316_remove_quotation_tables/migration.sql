/*
  Warnings:

  - You are about to drop the `Quotation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuotesUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Quotation` DROP FOREIGN KEY `Quotation_ID_USER_fkey`;

-- DropForeignKey
ALTER TABLE `Quotation` DROP FOREIGN KEY `Quotation_USER_CREATOR_fkey`;

-- DropForeignKey
ALTER TABLE `QuotesUsers` DROP FOREIGN KEY `QuotesUsers_ID_USER_fkey`;

-- DropForeignKey
ALTER TABLE `QuotesUsers` DROP FOREIGN KEY `QuotesUsers_QUOTE_ID_fkey`;

-- DropTable
DROP TABLE `Quotation`;

-- DropTable
DROP TABLE `QuotesUsers`;
