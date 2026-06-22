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
exports.AchievementsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AchievementsRepository = class AchievementsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.semesterId) {
            where.semesterId = query.semesterId;
        }
        if (query.category) {
            where.category = query.category;
        }
        if (query.userId) {
            where.userId = query.userId;
        }
        if (query.status) {
            where.status = query.status;
        }
        if (query.search) {
            where.OR = [
                { user: { fullName: { contains: query.search } } },
                { user: { studentCode: { contains: query.search } } },
                { note: { contains: query.search } },
                { competition: { name: { contains: query.search } } },
            ];
        }
        const sortBy = query.sortBy || 'createdAt';
        const sortOrder = (query.sortOrder || 'desc').toLowerCase();
        const orderBy = {
            [sortBy]: sortOrder,
        };
        const [total, data] = await Promise.all([
            this.prisma.achievement.count({ where }),
            this.prisma.achievement.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    user: {
                        select: {
                            id: true,
                            studentCode: true,
                            fullName: true,
                            email: true,
                            avatarUrl: true,
                        },
                    },
                    semester: true,
                    competition: true,
                    evidenceFile: true,
                },
            }),
        ]);
        return {
            total,
            data,
        };
    }
    async findById(id) {
        return this.prisma.achievement.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                semester: true,
                competition: true,
                evidenceFile: true,
            },
        });
    }
    async create(data) {
        return this.prisma.achievement.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                semester: true,
                competition: true,
                evidenceFile: true,
            },
        });
    }
    async update(id, data) {
        return this.prisma.achievement.update({
            where: { id },
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                semester: true,
                competition: true,
                evidenceFile: true,
            },
        });
    }
    async delete(id) {
        return this.prisma.achievement.delete({
            where: { id },
        });
    }
};
exports.AchievementsRepository = AchievementsRepository;
exports.AchievementsRepository = AchievementsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AchievementsRepository);
//# sourceMappingURL=achievements.repository.js.map