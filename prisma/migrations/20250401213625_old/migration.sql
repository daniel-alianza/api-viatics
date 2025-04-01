/*
  Warnings:

  - You are about to drop the `expense_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Card` DROP FOREIGN KEY `Card_ID_USER_fkey`;

-- DropForeignKey
ALTER TABLE `ExpenseDetail` DROP FOREIGN KEY `ExpenseDetail_ID_EXPENSE_REQUEST_fkey`;

-- DropForeignKey
ALTER TABLE `Quotation` DROP FOREIGN KEY `Quotation_ID_USER_fkey`;

-- DropForeignKey
ALTER TABLE `Quotation` DROP FOREIGN KEY `Quotation_USER_CREATOR_fkey`;

-- DropForeignKey
ALTER TABLE `QuotesUsers` DROP FOREIGN KEY `QuotesUsers_ID_USER_fkey`;

-- DropForeignKey
ALTER TABLE `expense_requests` DROP FOREIGN KEY `expense_requests_approverId_fkey`;

-- DropForeignKey
ALTER TABLE `expense_requests` DROP FOREIGN KEY `expense_requests_userId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_areaId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_roleId_fkey`;

-- DropTable
DROP TABLE `expense_requests`;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `User` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `NAME` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `ID_COMPANY` INTEGER NULL,
    `ID_BRANCH` INTEGER NULL,
    `ID_AREA` INTEGER NULL,
    `ID_ROLE` INTEGER NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_ID_COMPANY_fkey`(`ID_COMPANY`),
    INDEX `User_ID_BRANCH_fkey`(`ID_BRANCH`),
    INDEX `User_ID_AREA_fkey`(`ID_AREA`),
    INDEX `User_ID_ROLE_fkey`(`ID_ROLE`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExpenseRequest` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `ID_USER` INTEGER NOT NULL,
    `MONTO_TOTAL` DOUBLE NOT NULL,
    `STATUS` VARCHAR(191) NOT NULL DEFAULT 'Pendiente',
    `FECHA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `TRAVEL_REASON` VARCHAR(191) NOT NULL,
    `DEPARTURE_DATE` DATETIME(3) NOT NULL,
    `RETURN_DATE` DATETIME(3) NOT NULL,
    `DISBURSEMENT_DATE` DATETIME(3) NOT NULL,
    `TRAVEL_OBJECTIVES` VARCHAR(191) NOT NULL,

    INDEX `ExpenseRequest_ID_USER_fkey`(`ID_USER`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_ID_COMPANY_fkey` FOREIGN KEY (`ID_COMPANY`) REFERENCES `Company`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_ID_BRANCH_fkey` FOREIGN KEY (`ID_BRANCH`) REFERENCES `Branch`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_ID_AREA_fkey` FOREIGN KEY (`ID_AREA`) REFERENCES `Area`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_ID_ROLE_fkey` FOREIGN KEY (`ID_ROLE`) REFERENCES `Role`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_ID_USER_fkey` FOREIGN KEY (`ID_USER`) REFERENCES `User`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_USER_CREATOR_fkey` FOREIGN KEY (`USER_CREATOR`) REFERENCES `User`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExpenseRequest` ADD CONSTRAINT `ExpenseRequest_ID_USER_fkey` FOREIGN KEY (`ID_USER`) REFERENCES `User`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExpenseDetail` ADD CONSTRAINT `ExpenseDetail_ID_EXPENSE_REQUEST_fkey` FOREIGN KEY (`ID_EXPENSE_REQUEST`) REFERENCES `ExpenseRequest`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuotesUsers` ADD CONSTRAINT `QuotesUsers_ID_USER_fkey` FOREIGN KEY (`ID_USER`) REFERENCES `User`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_ID_USER_fkey` FOREIGN KEY (`ID_USER`) REFERENCES `User`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;
