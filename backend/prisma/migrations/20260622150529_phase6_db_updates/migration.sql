-- DropForeignKey
ALTER TABLE `Achievement` DROP FOREIGN KEY `Achievement_semesterId_fkey`;

-- DropForeignKey
ALTER TABLE `Competition` DROP FOREIGN KEY `Competition_semesterId_fkey`;

-- DropForeignKey
ALTER TABLE `ScholarshipCandidate` DROP FOREIGN KEY `ScholarshipCandidate_semesterId_fkey`;

-- DropForeignKey
ALTER TABLE `StudentSemesterScore` DROP FOREIGN KEY `StudentSemesterScore_semesterId_fkey`;

-- AlterTable
ALTER TABLE `Achievement` ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE `Competition` ADD CONSTRAINT `Competition_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `Semester`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Achievement` ADD CONSTRAINT `Achievement_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `Semester`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentSemesterScore` ADD CONSTRAINT `StudentSemesterScore_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `Semester`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScholarshipCandidate` ADD CONSTRAINT `ScholarshipCandidate_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `Semester`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
