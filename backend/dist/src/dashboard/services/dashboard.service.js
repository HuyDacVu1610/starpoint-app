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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(semesterId) {
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
                    deletedAt: null,
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
        return {
            totalStudents,
            totalCompetitions,
            totalAchievements,
            eligibleScholarships,
        };
    }
    async getCharts(semesterId) {
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
        return {
            categoryData,
            gradeData,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map