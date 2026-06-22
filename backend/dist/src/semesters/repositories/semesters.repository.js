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
exports.SemestersRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SemestersRepository = class SemestersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where.name = { contains: query.search };
        }
        const sortBy = query.sortBy || 'startDate';
        const sortOrder = (query.sortOrder || 'desc').toLowerCase();
        const orderBy = {
            [sortBy]: sortOrder,
        };
        const [total, data] = await Promise.all([
            this.prisma.semester.count({ where }),
            this.prisma.semester.findMany({
                where,
                skip,
                take: limit,
                orderBy,
            }),
        ]);
        return {
            total,
            data,
        };
    }
    async findById(id) {
        return this.prisma.semester.findUnique({
            where: { id },
        });
    }
    async findByYearAndTerm(year, term) {
        return this.prisma.semester.findFirst({
            where: { year, term },
        });
    }
    async create(data) {
        return this.prisma.semester.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.semester.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return this.prisma.semester.delete({
            where: { id },
        });
    }
};
exports.SemestersRepository = SemestersRepository;
exports.SemestersRepository = SemestersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SemestersRepository);
//# sourceMappingURL=semesters.repository.js.map