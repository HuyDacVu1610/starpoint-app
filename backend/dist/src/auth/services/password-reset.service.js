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
exports.PasswordResetService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const mail_service_1 = require("./mail.service");
const crypto_util_1 = require("../../shared/common/utils/crypto.util");
let PasswordResetService = class PasswordResetService {
    prisma;
    mailService;
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async requestReset(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                studentCode: dto.studentCode,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Mã số sinh viên không tồn tại trên hệ thống');
        }
        if (user.email.toLowerCase() !== dto.email.toLowerCase()) {
            throw new common_1.BadRequestException('Mã số sinh viên và email không khớp');
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        await this.prisma.passwordResetCode.deleteMany({
            where: { userId: user.id },
        });
        await this.prisma.passwordResetCode.create({
            data: {
                userId: user.id,
                code,
                expiresAt,
            },
        });
        await this.mailService.sendResetCode(user.email, code);
        return {
            success: true,
            message: 'Mã xác nhận đã được gửi tới email của bạn.',
        };
    }
    async verifyCode(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                studentCode: dto.studentCode,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Mã số sinh viên không tồn tại');
        }
        const resetCode = await this.prisma.passwordResetCode.findFirst({
            where: {
                userId: user.id,
                code: dto.code,
                isUsed: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        if (!resetCode) {
            throw new common_1.BadRequestException('Mã xác nhận không hợp lệ hoặc đã hết hạn');
        }
        return {
            success: true,
            message: 'Mã xác nhận hợp lệ.',
        };
    }
    async resetPassword(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                studentCode: dto.studentCode,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Mã số sinh viên không tồn tại');
        }
        const resetCode = await this.prisma.passwordResetCode.findFirst({
            where: {
                userId: user.id,
                code: dto.code,
                isUsed: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        if (!resetCode) {
            throw new common_1.BadRequestException('Mã xác nhận không hợp lệ hoặc đã hết hạn');
        }
        const hashedPassword = await (0, crypto_util_1.hash)(dto.newPassword);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            }),
            this.prisma.passwordResetCode.update({
                where: { id: resetCode.id },
                data: { isUsed: true },
            }),
        ]);
        return {
            success: true,
            message: 'Đặt lại mật khẩu thành công.',
        };
    }
};
exports.PasswordResetService = PasswordResetService;
exports.PasswordResetService = PasswordResetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], PasswordResetService);
//# sourceMappingURL=password-reset.service.js.map