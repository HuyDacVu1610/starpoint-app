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
exports.AchievementsController = void 0;
const common_1 = require("@nestjs/common");
const achievements_service_1 = require("../services/achievements.service");
const create_achievement_dto_1 = require("../dto/create-achievement.dto");
const update_achievement_dto_1 = require("../dto/update-achievement.dto");
const query_achievement_dto_1 = require("../dto/query-achievement.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../../shared/common/decorators/permissions.decorator");
const shared_1 = require("@starpointapp/shared");
let AchievementsController = class AchievementsController {
    achievementsService;
    constructor(achievementsService) {
        this.achievementsService = achievementsService;
    }
    async findAll(query) {
        return this.achievementsService.findAll(query);
    }
    async findMy(query, req) {
        query.userId = req.user.id;
        return this.achievementsService.findAll(query);
    }
    async findById(id, req) {
        return this.achievementsService.findById(id, req.user);
    }
    async create(dto, req) {
        const isStudent = req.user.roles.includes('STUDENT');
        const hasManage = req.user.permissions.includes('MANAGE_ACHIEVEMENT');
        if (!isStudent && !hasManage) {
            throw new common_1.ForbiddenException('Bạn không có quyền tạo thành tích');
        }
        return this.achievementsService.create(dto, req.user);
    }
    async update(id, dto, req) {
        const isStudent = req.user.roles.includes('STUDENT');
        const hasManage = req.user.permissions.includes('MANAGE_ACHIEVEMENT');
        if (!isStudent && !hasManage) {
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật thành tích');
        }
        return this.achievementsService.update(id, dto, req.user);
    }
    async delete(id, req) {
        const isStudent = req.user.roles.includes('STUDENT');
        const hasManage = req.user.permissions.includes('MANAGE_ACHIEVEMENT');
        if (!isStudent && !hasManage) {
            throw new common_1.ForbiddenException('Bạn không có quyền xoá thành tích');
        }
        return this.achievementsService.delete(id, req.user);
    }
    async review(id, status) {
        if (!status || !Object.values(shared_1.AchievementStatus).includes(status)) {
            throw new common_1.BadRequestException('Trạng thái duyệt không hợp lệ');
        }
        return this.achievementsService.review(id, status);
    }
};
exports.AchievementsController = AchievementsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('VIEW_ACHIEVEMENT'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_achievement_dto_1.QueryAchievementDto]),
    __metadata("design:returntype", Promise)
], AchievementsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_achievement_dto_1.QueryAchievementDto, Object]),
    __metadata("design:returntype", Promise)
], AchievementsController.prototype, "findMy", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AchievementsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_achievement_dto_1.CreateAchievementDto, Object]),
    __metadata("design:returntype", Promise)
], AchievementsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_achievement_dto_1.UpdateAchievementDto, Object]),
    __metadata("design:returntype", Promise)
], AchievementsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AchievementsController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':id/review'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('MANAGE_ACHIEVEMENT'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], AchievementsController.prototype, "review", null);
exports.AchievementsController = AchievementsController = __decorate([
    (0, common_1.Controller)('achievements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [achievements_service_1.AchievementsService])
], AchievementsController);
//# sourceMappingURL=achievements.controller.js.map