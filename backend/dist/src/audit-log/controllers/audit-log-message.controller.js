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
exports.AuditLogMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const audit_log_service_1 = require("../services/audit-log.service");
let AuditLogMessageController = class AuditLogMessageController {
    auditLogService;
    constructor(auditLogService) {
        this.auditLogService = auditLogService;
    }
    async handleScholarshipEvaluated(data) {
        console.log('Received scholarship.evaluated event via RabbitMQ:', data);
        const detail = `Đã xét duyệt học bổng cho học kỳ ID: ${data.semesterId}. Tổng số sinh viên được xét: ${data.evaluatedCount}, Số sinh viên đạt chuẩn: ${data.eligibleCount}. Chi tiết: Xuất sắc: ${data.tierCounts.EXCELLENT || 0}, Giỏi: ${data.tierCounts.GOOD || 0}, Khá: ${data.tierCounts.FAIR || 0}`;
        await this.auditLogService.log({
            action: 'EVALUATE',
            module: 'SCHOLARSHIP',
            detail,
        });
    }
};
exports.AuditLogMessageController = AuditLogMessageController;
__decorate([
    (0, microservices_1.EventPattern)('scholarship.evaluated'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditLogMessageController.prototype, "handleScholarshipEvaluated", null);
exports.AuditLogMessageController = AuditLogMessageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [audit_log_service_1.AuditLogService])
], AuditLogMessageController);
//# sourceMappingURL=audit-log-message.controller.js.map