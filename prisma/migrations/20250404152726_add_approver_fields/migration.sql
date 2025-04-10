/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[EMAIL]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `EMAIL` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `PASSWORD` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `User`;

-- AlterTable
ALTER TABLE `ExpenseRequest` ADD COLUMN `APPROVER_ID` INTEGER NULL,
    ADD COLUMN `COMMENT` TEXT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `email`,
    DROP COLUMN `password`,
    ADD COLUMN `EMAIL` VARCHAR(191) NOT NULL,
    ADD COLUMN `PASSWORD` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `ExpenseRequest_APPROVER_ID_fkey` ON `ExpenseRequest`(`APPROVER_ID`);

-- CreateIndex
CREATE UNIQUE INDEX `User_EMAIL_key` ON `User`(`EMAIL`);

-- AddForeignKey
ALTER TABLE `ExpenseRequest` ADD CONSTRAINT `ExpenseRequest_APPROVER_ID_fkey` FOREIGN KEY (`APPROVER_ID`) REFERENCES `User`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;
