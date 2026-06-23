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
exports.ScoresRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ScoresRepository = class ScoresRepository {
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
        if (query.userId) {
            where.userId = query.userId;
        }
        if (query.search) {
            where.user = {
                OR: [
                    { studentCode: { contains: query.search } },
                    { fullName: { contains: query.search } },
                ],
            };
        }
        const sortBy = query.sortBy || 'createdAt';
        const sortOrder = (query.sortOrder || 'desc').toLowerCase();
        let orderBy = {
            [sortBy]: sortOrder,
        };
        if (sortBy === 'studentCode' || sortBy === 'fullName') {
            orderBy = {
                user: {
                    [sortBy]: sortOrder,
                },
            };
        }
        const [total, data] = await Promise.all([
            this.prisma.studentSemesterScore.count({ where }),
            this.prisma.studentSemesterScore.findMany({
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
                },
            }),
        ]);
        return {
            total,
            data,
        };
    }
    async findById(id) {
        return this.prisma.studentSemesterScore.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        email: true,
                    },
                },
                semester: true,
            },
        });
    }
    async findByUserAndSemester(userId, semesterId) {
        return this.prisma.studentSemesterScore.findUnique({
            where: {
                userId_semesterId: {
                    userId,
                    semesterId,
                },
            },
        });
    }
    async upsert(userId, semesterId, data) {
        return this.prisma.studentSemesterScore.upsert({
            where: {
                userId_semesterId: {
                    userId,
                    semesterId,
                },
            },
            update: data,
            create: {
                userId,
                semesterId,
                ...data,
            },
        });
    }
};
exports.ScoresRepository = ScoresRepository;
exports.ScoresRepository = ScoresRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScoresRepository);
//# sourceMappingURL=scores.repository.js.map