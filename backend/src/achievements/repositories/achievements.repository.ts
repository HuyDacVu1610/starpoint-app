import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryAchievementDto } from '../dto/query-achievement.dto';

@Injectable()
export class AchievementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryAchievementDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.AchievementWhereInput = {};

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
    const sortOrder = (query.sortOrder || 'desc').toLowerCase() as
      | 'asc'
      | 'desc';
    const orderBy: Prisma.AchievementOrderByWithRelationInput = {
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

  async findById(id: number) {
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

  async create(data: Prisma.AchievementUncheckedCreateInput) {
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

  async update(id: number, data: Prisma.AchievementUncheckedUpdateInput) {
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

  async delete(id: number) {
    return this.prisma.achievement.delete({
      where: { id },
    });
  }
}
