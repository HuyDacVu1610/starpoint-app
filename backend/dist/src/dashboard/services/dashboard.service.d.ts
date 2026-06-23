import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStats(semesterId: number): Promise<{
        totalStudents: number;
        totalCompetitions: number;
        totalAchievements: number;
        eligibleScholarships: number;
    }>;
    getCharts(semesterId: number): Promise<{
        categoryData: {
            category: import("@prisma/client").$Enums.AchievementCategory;
            count: number;
        }[];
        gradeData: {
            grade: import("@prisma/client").$Enums.Grade;
            count: number;
        }[];
    }>;
}
