import { DashboardService } from '../services/dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardController {
    private readonly dashboardService;
    private readonly prisma;
    constructor(dashboardService: DashboardService, prisma: PrismaService);
    getStats(semesterId?: string): Promise<{
        totalStudents: number;
        totalCompetitions: number;
        totalAchievements: number;
        eligibleScholarships: number;
    }>;
    getCharts(semesterId?: string): Promise<{
        categoryData: {
            category: import("@prisma/client").$Enums.AchievementCategory;
            count: number;
        }[];
        gradeData: {
            grade: import("@prisma/client").$Enums.Grade;
            count: number;
        }[];
    }>;
    private resolveSemesterId;
}
