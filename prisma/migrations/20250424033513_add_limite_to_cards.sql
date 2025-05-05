-- AlterTable
ALTER TABLE `Card` ADD COLUMN `LIMITE` DECIMAL(65,30) NOT NULL DEFAULT 0.01;

-- Actualizar todas las tarjetas existentes con el límite por defecto
UPDATE `Card` SET `LIMITE` = 0.01 WHERE `LIMITE` IS NULL; 