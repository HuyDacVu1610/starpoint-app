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
exports.CompetitionsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CompetitionsRepository = class CompetitionsRepository {
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
        if (query.level) {
            where.level = query.level;
        }
        if (query.search) {
            where.OR = [
                { name: { contains: query.search } },
                { organizer: { contains: query.search } },
            ];
        }
        const sortBy = query.sortBy || 'eventDate';
        const sortOrder = (query.sortOrder || 'desc').toLowerCase();
        const orderBy = {
            [sortBy]: sortOrder,
        };
        const [total, data] = await Promise.all([
            this.prisma.competition.count({ where }),
            this.prisma.competition.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
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
        return this.prisma.competition.findUnique({
            where: { id },
            include: {
                semester: true,
            },
        });
    }
    async create(data) {
        return this.prisma.competition.create({
            data,
            include: {
                semester: true,
            },
        });
    }
    async update(id, data) {
        return this.prisma.competition.update({
            where: { id },
            data,
            include: {
                semester: true,
            },
        });
    }
    async delete(id) {
        return this.prisma.competition.delete({
            where: { id },
        });
    }
};
exports.CompetitionsRepository = CompetitionsRepository;
exports.CompetitionsRepository = CompetitionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompetitionsRepository);
//# sourceMappingURL=competitions.repository.js.map