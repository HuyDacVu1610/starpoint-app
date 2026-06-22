"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors = [];
        if (exception instanceof common_1.HttpException) {
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
                errors = [res];
            }
            else if (res && typeof res === 'object') {
                const resMessage = res.message;
                if (Array.isArray(resMessage)) {
                    errors = resMessage.map(String);
                    message = 'Validation failed';
                }
                else if (typeof resMessage === 'string') {
                    errors = [resMessage];
                    message = resMessage;
                }
                else {
                    message = exception.message;
                    errors = [message];
                }
            }
        }
        else {
            const err = exception;
            message = err?.message || 'An unexpected error occurred';
            errors = [message];
            console.error('Unhandled Exception:', exception);
        }
        response.status(status).json({
            success: false,
            message,
            errors,
        });
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map