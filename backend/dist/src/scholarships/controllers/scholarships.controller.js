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
exports.ScholarshipsController = void 0;
const common_1 = require("@nestjs/common");
const scholarships_service_1 = require("../services/scholarships.service");
const query_candidate_dto_1 = require("../dto/query-candidate.dto");
const evaluate_scholarship_dto_1 = require("../dto/evaluate-scholarship.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../../shared/common/decorators/permissions.decorator");
const log_action_decorator_1 = require("../../shared/common/decorators/log-action.decorator");
let ScholarshipsController = class ScholarshipsController {
    scholarshipsService;
    constructor(scholarshipsService) {
        this.scholarshipsService = scholarshipsService;
    }
    async findAll(query) {
        return this.scholarshipsService.findAll(query);
    }
    async findMy(query, req) {
        query.userId = req.user.id;
        query.search = undefined;
        return this.scholarshipsService.findAll(query);
    }
    async evaluate(dto) {
        return this.scholarshipsService.evaluateScholarships(dto.semesterId);
    }
};
exports.ScholarshipsController = ScholarshipsController;
__decorate([
    (0, common_1.Get)('candidates'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('VIEW_SCHOLARSHIP'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_candidate_dto_1.QueryCandidateDto]),
    __metadata("design:returntype", Promise)
], ScholarshipsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_candidate_dto_1.QueryCandidateDto, Object]),
    __metadata("design:returntype", Promise)
], ScholarshipsController.prototype, "findMy", null);
__decorate([
    (0, common_1.Post)('evaluate'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('MANAGE_SCHOLARSHIP'),
    (0, log_action_decorator_1.LogAction)('EVALUATE', 'SCHOLARSHIP'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [evaluate_scholarship_dto_1.EvaluateScholarshipDto]),
    __metadata("design:returntype", Promise)
], ScholarshipsController.prototype, "evaluate", null);
exports.ScholarshipsController = ScholarshipsController = __decorate([
    (0, common_1.Controller)('scholarships'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [scholarships_service_1.ScholarshipsService])
], ScholarshipsController);
//# sourceMappingURL=scholarships.controller.js.map