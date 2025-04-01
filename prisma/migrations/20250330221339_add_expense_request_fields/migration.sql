/*
  Warnings:

  - Added the required column `DEPARTURE_DATE` to the `ExpenseRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DISBURSEMENT_DATE` to the `ExpenseRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `RETURN_DATE` to the `ExpenseRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TRAVEL_OBJECTIVES` to the `ExpenseRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TRAVEL_REASON` to the `ExpenseRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ExpenseRequest` ADD COLUMN `DEPARTURE_DATE` DATETIME(3) NOT NULL,
    ADD COLUMN `DISBURSEMENT_DATE` DATETIME(3) NOT NULL,
    ADD COLUMN `RETURN_DATE` DATETIME(3) NOT NULL,
    ADD COLUMN `TRAVEL_OBJECTIVES` VARCHAR(191) NOT NULL,
    ADD COLUMN `TRAVEL_REASON` VARCHAR(191) NOT NULL;
