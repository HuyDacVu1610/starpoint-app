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
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const log_action_decorator_1 = require("../decorators/log-action.decorator");
const audit_log_service_1 = require("../../../audit-log/services/audit-log.service");
let AuditLogInterceptor = class AuditLogInterceptor {
    reflector;
    auditLogService;
    constructor(reflector, auditLogService) {
        this.reflector = reflector;
        this.auditLogService = auditLogService;
    }
    intercept(context, next) {
        const meta = this.reflector.getAllAndOverride(log_action_decorator_1.LOG_ACTION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!meta) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const userId = user?.id;
        const bodyCopy = { ...request.body };
        const sensitiveKeys = ['password', 'currentPassword', 'newPassword'];
        for (const key of sensitiveKeys) {
            if (key in bodyCopy) {
                bodyCopy[key] = '[FILTERED]';
            }
        }
        const detailObj = {
            params: request.params,
            query: request.query,
            body: bodyCopy,
        };
        return next.handle().pipe((0, operators_1.tap)(() => {
            void this.auditLogService.log({
                userId,
                action: meta.action,
                module: meta.module,
                detail: JSON.stringify(detailObj),
            });
        }));
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        audit_log_service_1.AuditLogService])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map