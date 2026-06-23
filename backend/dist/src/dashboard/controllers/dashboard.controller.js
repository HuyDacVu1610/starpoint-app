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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("../services/dashboard.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../../shared/common/decorators/permissions.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
let DashboardController = class DashboardController {
    dashboardService;
    prisma;
    constructor(dashboardService, prisma) {
        this.dashboardService = dashboardService;
        this.prisma = prisma;
    }
    async getStats(semesterId) {
        const semId = await this.resolveSemesterId(semesterId);
        if (!semId)
            return { totalStudents: 0, totalCompetitions: 0, totalAchievements: 0, eligibleScholarships: 0 };
        return this.dashboardService.getStats(semId);
    }
    async getCharts(semesterId) {
        const semId = await this.resolveSemesterId(semesterId);
        if (!semId)
            return { categoryData: [], gradeData: [] };
        return this.dashboardService.getCharts(semId);
    }
    async resolveSemesterId(semesterId) {
        if (semesterId) {
            return Number(semesterId);
        }
        const latest = await this.prisma.semester.findFirst({
            orderBy: { startDate: 'desc' },
        });
        return latest ? latest.id : null;
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, permissions_decorator_1.RequirePermissions)('VIEW_DASHBOARD'),
    __param(0, (0, common_1.Query)('semesterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('charts'),
    (0, permissions_decorator_1.RequirePermissions)('VIEW_DASHBOARD'),
    __param(0, (0, common_1.Query)('semesterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCharts", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService,
        prisma_service_1.PrismaService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map