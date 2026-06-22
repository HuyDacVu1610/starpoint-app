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
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersRepository = class UsersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
        if (query.search) {
            where.OR = [
                { studentCode: { contains: query.search } },
                { fullName: { contains: query.search } },
                { email: { contains: query.search } },
            ];
        }
        const sortBy = query.sortBy || 'createdAt';
        const sortOrder = (query.sortOrder || 'desc').toLowerCase();
        const orderBy = {
            [sortBy]: sortOrder,
        };
        const [total, data] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    userRoles: {
                        include: {
                            role: true,
                        },
                    },
                },
            }),
        ]);
        return {
            total,
            data,
        };
    }
    async findById(id) {
        return this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }
    async findByStudentCode(studentCode) {
        return this.prisma.user.findFirst({
            where: { studentCode, deletedAt: null },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }
    async create(data, roleIds) {
        return this.prisma.user.create({
            data: {
                ...data,
                userRoles: {
                    create: roleIds.map((roleId) => ({
                        roleId,
                    })),
                },
            },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }
    async update(id, data, roleIds) {
        if (roleIds !== undefined) {
            return this.prisma.$transaction(async (tx) => {
                await tx.userRole.deleteMany({
                    where: { userId: id },
                });
                return tx.user.update({
                    where: { id },
                    data: {
                        ...data,
                        userRoles: {
                            create: roleIds.map((roleId) => ({
                                roleId,
                            })),
                        },
                    },
                    include: {
                        userRoles: {
                            include: {
                                role: true,
                            },
                        },
                    },
                });
            });
        }
        return this.prisma.user.update({
            where: { id },
            data,
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }
    async softDelete(id) {
        return this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map