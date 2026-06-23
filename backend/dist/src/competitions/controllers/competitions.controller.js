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
exports.CompetitionsController = void 0;
const common_1 = require("@nestjs/common");
const competitions_service_1 = require("../services/competitions.service");
const create_competition_dto_1 = require("../dto/create-competition.dto");
const update_competition_dto_1 = require("../dto/update-competition.dto");
const query_competition_dto_1 = require("../dto/query-competition.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../../shared/common/decorators/permissions.decorator");
const log_action_decorator_1 = require("../../shared/common/decorators/log-action.decorator");
let CompetitionsController = class CompetitionsController {
    competitionsService;
    constructor(competitionsService) {
        this.competitionsService = competitionsService;
    }
    async findAll(query) {
        return this.competitionsService.findAll(query);
    }
    async findById(id) {
        return this.competitionsService.findById(id);
    }
    async create(dto) {
        return this.competitionsService.create(dto);
    }
    async update(id, dto) {
        return this.competitionsService.update(id, dto);
    }
    async delete(id) {
        return this.competitionsService.delete(id);
    }
};
exports.CompetitionsController = CompetitionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_competition_dto_1.QueryCompetitionDto]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('MANAGE_COMPETITION'),
    (0, log_action_decorator_1.LogAction)('CREATE', 'COMPETITION'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_competition_dto_1.CreateCompetitionDto]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('MANAGE_COMPETITION'),
    (0, log_action_decorator_1.LogAction)('UPDATE', 'COMPETITION'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_competition_dto_1.UpdateCompetitionDto]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('MANAGE_COMPETITION'),
    (0, log_action_decorator_1.LogAction)('DELETE', 'COMPETITION'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "delete", null);
exports.CompetitionsController = CompetitionsController = __decorate([
    (0, common_1.Controller)('competitions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [competitions_service_1.CompetitionsService])
], CompetitionsController);
//# sourceMappingURL=competitions.controller.js.map