-- AlterTable
ALTER TABLE `ScholarshipCandidate` MODIFY `conductGrade` ENUM('EXCELLENT', 'GOOD', 'FAIR', 'AVERAGE', 'WEAK', 'POOR') NULL,
    MODIFY `gpaGrade` ENUM('EXCELLENT', 'GOOD', 'FAIR', 'AVERAGE', 'WEAK', 'POOR') NULL;

-- AlterTable
ALTER TABLE `StudentSemesterScore` MODIFY `gpa` DOUBLE NULL,
    MODIFY `conductScore` DOUBLE NULL,
    MODIFY `conductGrade` ENUM('EXCELLENT', 'GOOD', 'FAIR', 'AVERAGE', 'WEAK', 'POOR') NULL,
    MODIFY `gpaGrade` ENUM('EXCELLENT', 'GOOD', 'FAIR', 'AVERAGE', 'WEAK', 'POOR') NULL;
