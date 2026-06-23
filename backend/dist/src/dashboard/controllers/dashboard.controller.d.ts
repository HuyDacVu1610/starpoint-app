import { DashboardService } from '../services/dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardController {
    private readonly dashboardService;
    private readonly prisma;
    constructor(dashboardService: DashboardService, prisma: PrismaService);
    getStats(semesterId?: string): Promise<any>;
    getCharts(semesterId?: string): Promise<any>;
    private resolveSemesterId;
}
