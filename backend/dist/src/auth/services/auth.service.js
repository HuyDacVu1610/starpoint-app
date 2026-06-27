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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const crypto_util_1 = require("../../shared/common/utils/crypto.util");
let AuthService = class AuthService {
    prisma;
    jwtService;
    config;
    activeRefreshTokens = new Map();
    constructor(prisma, jwtService, config) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
    }
    async login(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                studentCode: dto.studentCode,
            },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
        }
        const isPasswordValid = await (0, crypto_util_1.compare)(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
        }
        const roles = user.userRoles.map((ur) => ur.role.name);
        const permissions = Array.from(new Set(user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.name))));
        const tokens = await this.generateTokens(user.id, user.studentCode, user.email, roles, permissions);
        this.activeRefreshTokens.set(user.id, tokens.refreshToken);
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        return {
            ...tokens,
            user: {
                ...userWithoutPassword,
                roles,
                permissions,
            },
        };
    }
    logout(userId) {
        this.activeRefreshTokens.delete(userId);
        return {
            success: true,
            message: 'Đăng xuất thành công',
        };
    }
    async refreshTokens(userId, refreshToken) {
        const storedToken = this.activeRefreshTokens.get(userId);
        if (!storedToken || storedToken !== refreshToken) {
            throw new common_1.ForbiddenException('Yêu cầu bị từ chối: Phiên làm việc không hợp lệ');
        }
        const user = await this.prisma.user.findFirst({
            where: { id: userId },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.ForbiddenException('Người dùng không tồn tại');
        }
        const roles = user.userRoles.map((ur) => ur.role.name);
        const permissions = Array.from(new Set(user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.name))));
        const tokens = await this.generateTokens(user.id, user.studentCode, user.email, roles, permissions);
        this.activeRefreshTokens.set(user.id, tokens.refreshToken);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Người dùng không tồn tại');
        }
        const roles = user.userRoles.map((ur) => ur.role.name);
        const permissions = Array.from(new Set(user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.name))));
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        return {
            user: {
                ...userWithoutPassword,
                roles,
                permissions,
            },
        };
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Người dùng không hợp lệ');
        }
        const isPasswordValid = await (0, crypto_util_1.compare)(dto.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Mật khẩu hiện tại không đúng');
        }
        const newHashedPassword = await (0, crypto_util_1.hash)(dto.newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: newHashedPassword },
        });
        return {
            success: true,
            message: 'Đổi mật khẩu thành công',
        };
    }
    async generateTokens(userId, studentCode, email, roles, permissions) {
        const payload = {
            sub: userId,
            studentCode,
            email,
            roles,
            permissions,
        };
        const accessTokenSecret = this.config.get('JWT_SECRET') ||
            'dev-jwt-access-secret-key-1234567890-abcdef';
        const refreshTokenSecret = this.config.get('JWT_REFRESH_SECRET') ||
            'dev-jwt-refresh-secret-key-0987654321-fedcba';
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: accessTokenSecret,
                expiresIn: '15m',
            }),
            this.jwtService.signAsync({ sub: userId, studentCode, email }, {
                secret: refreshTokenSecret,
                expiresIn: '7d',
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map