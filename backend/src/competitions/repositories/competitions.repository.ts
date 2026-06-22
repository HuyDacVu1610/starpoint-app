import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryCompetitionDto } from '../dto/query-competition.dto';

@Injectable()
export class CompetitionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryCompetitionDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CompetitionWhereInput = {};

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
    const sortOrder = (query.sortOrder || 'desc').toLowerCase() as
      | 'asc'
      | 'desc';
    const orderBy: Prisma.CompetitionOrderByWithRelationInput = {
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

  async findById(id: number) {
    return this.prisma.competition.findUnique({
      where: { id },
      include: {
        semester: true,
      },
    });
  }

  async create(data: Prisma.CompetitionUncheckedCreateInput) {
    return this.prisma.competition.create({
      data,
      include: {
        semester: true,
      },
    });
  }

  async update(id: number, data: Prisma.CompetitionUncheckedUpdateInput) {
    return this.prisma.competition.update({
      where: { id },
      data,
      include: {
        semester: true,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.competition.delete({
      where: { id },
    });
  }
}
