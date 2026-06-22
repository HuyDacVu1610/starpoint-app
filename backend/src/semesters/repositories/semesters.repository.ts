import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';

@Injectable()
export class SemestersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SemesterWhereInput = {};

    if (query.search) {
      where.name = { contains: query.search };
    }

    const sortBy = query.sortBy || 'startDate';
    const sortOrder = (query.sortOrder || 'desc').toLowerCase() as
      | 'asc'
      | 'desc';
    const orderBy: Prisma.SemesterOrderByWithRelationInput = {
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

  async findById(id: number) {
    return this.prisma.semester.findUnique({
      where: { id },
    });
  }

  async findByYearAndTerm(year: number, term: number) {
    return this.prisma.semester.findFirst({
      where: { year, term },
    });
  }

  async create(data: Prisma.SemesterCreateInput) {
    return this.prisma.semester.create({
      data,
    });
  }

  async update(id: number, data: Prisma.SemesterUpdateInput) {
    return this.prisma.semester.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.semester.delete({
      where: { id },
    });
  }
}
