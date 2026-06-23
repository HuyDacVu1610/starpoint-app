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
exports.AuditLogRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuditLogRepository = class AuditLogRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.auditLog.create({
            data: {
                userId: data.userId || null,
                action: data.action,
                module: data.module,
                detail: data.detail || null,
            },
        });
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.action) {
            where.action = query.action;
        }
        if (query.module) {
            where.module = query.module;
        }
        if (query.search) {
            where.OR = [
                { module: { contains: query.search } },
                { action: { contains: query.search } },
                { detail: { contains: query.search } },
                {
                    user: {
                        fullName: { contains: query.search },
                    },
                },
            ];
        }
        if (query.startDate || query.endDate) {
            where.timestamp = {};
            if (query.startDate) {
                where.timestamp.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.timestamp.lte = new Date(query.endDate);
            }
        }
        const [items, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { timestamp: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            studentCode: true,
                            fullName: true,
                        },
                    },
                },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return {
            items,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.AuditLogRepository = AuditLogRepository;
exports.AuditLogRepository = AuditLogRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogRepository);
//# sourceMappingURL=audit-log.repository.js.map