-- CreateTable
CREATE TABLE `SapStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `comprobacionId` INTEGER NOT NULL,
    `isSentToSap` BOOLEAN NOT NULL DEFAULT false,
    `sapDocEntry` VARCHAR(191) NULL,
    `sentAt` DATETIME(3) NULL,
    `sentBy` INTEGER NULL,
    `sapResponse` VARCHAR(191) NULL,
    `errorMessage` VARCHAR(191) NULL,

    UNIQUE INDEX `SapStatus_comprobacionId_key`(`comprobacionId`),
    INDEX `SapStatus_comprobacionId_idx`(`comprobacionId`),
    INDEX `SapStatus_sentBy_idx`(`sentBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SapStatus` ADD CONSTRAINT `SapStatus_comprobacionId_fkey` FOREIGN KEY (`comprobacionId`) REFERENCES `Comprobacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SapStatus` ADD CONSTRAINT `SapStatus_sentBy_fkey` FOREIGN KEY (`sentBy`) REFERENCES `User`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;
