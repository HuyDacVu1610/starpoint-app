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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.role.findMany({
            orderBy: { id: 'asc' },
        });
    }
    async findById(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Vai trò với ID ${id} không tồn tại`);
        }
        return role;
    }
    async create(dto) {
        const existing = await this.prisma.role.findUnique({
            where: { name: dto.name },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Vai trò với tên "${dto.name}" đã tồn tại`);
        }
        return this.prisma.role.create({
            data: {
                name: dto.name,
                description: dto.description,
                rolePermissions: {
                    create: (dto.permissionIds || []).map((pId) => ({
                        permissionId: pId,
                    })),
                },
            },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
    async update(id, dto) {
        const role = await this.findById(id);
        if (dto.name && dto.name !== role.name) {
            const existing = await this.prisma.role.findUnique({
                where: { name: dto.name },
            });
            if (existing) {
                throw new common_1.BadRequestException(`Vai trò với tên "${dto.name}" đã tồn tại`);
            }
        }
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.permissionIds !== undefined) {
            return this.prisma.$transaction(async (tx) => {
                await tx.rolePermission.deleteMany({
                    where: { roleId: id },
                });
                return tx.role.update({
                    where: { id },
                    data: {
                        ...updateData,
                        rolePermissions: {
                            create: dto.permissionIds.map((pId) => ({
                                permissionId: pId,
                            })),
                        },
                    },
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                });
            });
        }
        return this.prisma.role.update({
            where: { id },
            data: updateData,
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map