/*
  Warnings:

  - You are about to drop the `ExpenseRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Card` DROP FOREIGN KEY `Card_ID_USER_fkey`;

-- DropForeignKey
ALTER TABLE `ExpenseDetail` DROP FOREIGN KEY `ExpenseDetail_ID_EXPENSE_REQUEST_fkey`;

-- DropForeignKey
ALTER TABLE `ExpenseRequest` DROP FOREIGN KEY `ExpenseRequest_APPROVED_BY_fkey`;

-- DropForeignKey
ALTER TABLE `ExpenseRequest` DROP FOREIGN KEY `ExpenseRequest_ID_USER_fkey`;

-- DropForeignKey
ALTER TABLE `Quotation` DROP FOREIGN KEY `Quotation_ID_USER_fkey`;

-- DropForeignKey
ALTER TABLE `Quotation` DROP FOREIGN KEY `Quotation_USER_CREATOR_fkey`;

-- DropForeignKey
ALTER TABLE `QuotesUsers` DROP FOREIGN KEY `QuotesUsers_ID_USER_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_ID_AREA_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_ID_BRANCH_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_ID_COMPANY_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_ID_ROLE_fkey`;

-- DropTable
DROP TABLE `ExpenseRequest`;

-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `branchId` INTEGER NOT NULL,
    `areaId` INTEGER NOT NULL,
    `roleId` INTEGER NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `totalAmount` DECIMAL(65, 30) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pendiente',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `travelReason` VARCHAR(191) NOT NULL,
    `departureDate` DATETIME(3) NOT NULL,
    `returnDate` DATETIME(3) NOT NULL,
    `disbursementDate` DATETIME(3) NOT NULL,
    `travelObjectives` VARCHAR(191) NOT NULL,
    `approverId` INTEGER NULL,
    `comment` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_ID_USER_fkey` FOREIGN KEY (`ID_USER`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_USER_CREATOR_fkey` FOREIGN KEY (`USER_CREATOR`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense_requests` ADD CONSTRAINT `expense_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense_requests` ADD CONSTRAINT `expense_requests_approverId_fkey` FOREIGN KEY (`approverId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExpenseDetail` ADD CONSTRAINT `ExpenseDetail_ID_EXPENSE_REQUEST_fkey` FOREIGN KEY (`ID_EXPENSE_REQUEST`) REFERENCES `expense_requests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuotesUsers` ADD CONSTRAINT `QuotesUsers_ID_USER_fkey` FOREIGN KEY (`ID_USER`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_ID_USER_fkey` FOREIGN KEY (`ID_USER`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
