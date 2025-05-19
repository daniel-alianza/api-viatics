/*
  Warnings:

  - You are about to drop the `Quote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Quote`;

-- CreateTable
CREATE TABLE `InspirationQuote` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `CONTENT` VARCHAR(191) NOT NULL,
    `AUTHOR` VARCHAR(191) NULL,
    `CREATED_AT` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
