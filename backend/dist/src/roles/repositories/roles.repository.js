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
exports.RolesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RolesRepository = class RolesRepository {
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
        return this.prisma.role.findUnique({
            where: { id },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
    async findByName(name) {
        return this.prisma.role.findUnique({
            where: { name },
        });
    }
    async create(name, description, permissionIds = []) {
        return this.prisma.role.create({
            data: {
                name,
                description,
                rolePermissions: {
                    create: permissionIds.map((pId) => ({
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
    async update(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.permissionIds !== undefined) {
            return this.prisma.$transaction(async (tx) => {
                await tx.rolePermission.deleteMany({
                    where: { roleId: id },
                });
                return tx.role.update({
                    where: { id },
                    data: {
                        ...updateData,
                        rolePermissions: {
                            create: data.permissionIds.map((pId) => ({
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
exports.RolesRepository = RolesRepository;
exports.RolesRepository = RolesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesRepository);
//# sourceMappingURL=roles.repository.js.map