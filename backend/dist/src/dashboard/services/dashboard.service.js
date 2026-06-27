"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    cacheManager;
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    async getStats(semesterId) {
        const cacheKey = `dashboard:stats:${semesterId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const [totalStudents, totalCompetitions, totalAchievements, eligibleScholarships] = await Promise.all([
            this.prisma.user.count({
                where: {
                    userRoles: {
                        some: {
                            role: {
                                name: 'STUDENT',
                            },
                        },
                    },
                },
            }),
            this.prisma.competition.count({
                where: { semesterId },
            }),
            this.prisma.achievement.count({
                where: { semesterId, status: 'APPROVED' },
            }),
            this.prisma.scholarshipCandidate.count({
                where: { semesterId, isEligible: true },
            }),
        ]);
        const result = {
            totalStudents,
            totalCompetitions,
            totalAchievements,
            eligibleScholarships,
        };
        await this.cacheManager.set(cacheKey, result, 300 * 1000);
        return result;
    }
    async getCharts(semesterId) {
        const cacheKey = `dashboard:charts:${semesterId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const [achievementsByCategory, gpaGradeDistribution] = await Promise.all([
            this.prisma.achievement.groupBy({
                by: ['category'],
                where: { semesterId, status: 'APPROVED' },
                _count: {
                    id: true,
                },
            }),
            this.prisma.studentSemesterScore.groupBy({
                by: ['gpaGrade'],
                where: { semesterId },
                _count: {
                    id: true,
                },
            }),
        ]);
        const categoryData = achievementsByCategory.map((item) => ({
            category: item.category,
            count: item._count.id,
        }));
        const gradeData = gpaGradeDistribution.map((item) => ({
            grade: item.gpaGrade,
            count: item._count.id,
        }));
        const result = {
            categoryData,
            gradeData,
        };
        await this.cacheManager.set(cacheKey, result, 300 * 1000);
        return result;
    }
    async clearCache(semesterId) {
        const keys = [`dashboard:stats:${semesterId}`, `dashboard:charts:${semesterId}`];
        for (const key of keys) {
            await this.cacheManager.del(key);
        }
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map