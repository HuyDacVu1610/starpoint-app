import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId?: number; action: string; module: string; detail?: string }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        action: data.action,
        module: data.module,
        detail: data.detail || null,
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
    module?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

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
}
