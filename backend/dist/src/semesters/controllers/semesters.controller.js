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
exports.SemestersController = void 0;
const common_1 = require("@nestjs/common");
const semesters_service_1 = require("../services/semesters.service");
const scores_service_1 = require("../../scores/services/scores.service");
const create_semester_dto_1 = require("../dto/create-semester.dto");
const update_semester_dto_1 = require("../dto/update-semester.dto");
const pagination_query_dto_1 = require("../../shared/common/dto/pagination-query.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../../shared/common/decorators/permissions.decorator");
const log_action_decorator_1 = require("../../shared/common/decorators/log-action.decorator");
let SemestersController = class SemestersController {
    semestersService;
    scoresService;
    constructor(semestersService, scoresService) {
        this.semestersService = semestersService;
        this.scoresService = scoresService;
    }
    async findAll(query) {
        return this.semestersService.findAll(query);
    }
    async findById(id) {
        return this.semestersService.findById(id);
    }
    async create(dto) {
        return this.semestersService.create(dto);
    }
    async update(id, dto) {
        return this.semestersService.update(id, dto);
    }
    async delete(id) {
        return this.semestersService.delete(id);
    }
    async updateStudentScore(semesterId, studentCode, dto) {
        return this.scoresService.updateManualScore(semesterId, studentCode, dto);
    }
};
exports.SemestersController = SemestersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], SemestersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SemestersController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('MANAGE_SEMESTER'),
    (0, log_action_decorator_1.LogAction)('CREATE', 'SEMESTER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_semester_dto_1.CreateSemesterDto]),
    __metadata("design:returntype", Promise)
], SemestersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('MANAGE_SEMESTER'),
    (0, log_action_decorator_1.LogAction)('UPDATE', 'SEMESTER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_semester_dto_1.UpdateSemesterDto]),
    __metadata("design:returntype", Promise)
], SemestersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('MANAGE_SEMESTER'),
    (0, log_action_decorator_1.LogAction)('DELETE', 'SEMESTER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SemestersController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':semesterId/students/:studentCode'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('MANAGE_BONUS'),
    (0, log_action_decorator_1.LogAction)('UPDATE', 'SCORE'),
    __param(0, (0, common_1.Param)('semesterId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('studentCode')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], SemestersController.prototype, "updateStudentScore", null);
exports.SemestersController = SemestersController = __decorate([
    (0, common_1.Controller)('semesters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [semesters_service_1.SemestersService,
        scores_service_1.ScoresService])
], SemestersController);
//# sourceMappingURL=semesters.controller.js.map