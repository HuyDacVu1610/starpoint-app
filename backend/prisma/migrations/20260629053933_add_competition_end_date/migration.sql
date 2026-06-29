/*
  Warnings:

  - Added the required column `endDate` to the `Competition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable (Safe migration for existing rows)
ALTER TABLE `Competition` ADD COLUMN `endDate` DATETIME(3) NULL;

-- Copy eventDate to endDate for existing rows
UPDATE `Competition` SET `endDate` = `eventDate`;

-- Make endDate NOT NULL
ALTER TABLE `Competition` MODIFY `endDate` DATETIME(3) NOT NULL;
