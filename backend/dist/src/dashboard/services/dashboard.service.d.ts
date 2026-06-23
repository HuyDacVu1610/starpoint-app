import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    private readonly cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    getStats(semesterId: number): Promise<any>;
    getCharts(semesterId: number): Promise<any>;
    clearCache(semesterId: number): Promise<void>;
}
