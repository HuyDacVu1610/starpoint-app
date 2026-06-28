import { Injectable } from '@nestjs/common';
import { Prisma, Grade } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryScoreDto } from '../dto/query-score.dto';

@Injectable()
export class ScoresRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryScoreDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentSemesterScoreWhereInput = {};

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
    const sortOrder = (query.sortOrder || 'desc').toLowerCase() as
      | 'asc'
      | 'desc';

    // Support sorting by user fields or normal fields
    let orderBy: Prisma.StudentSemesterScoreOrderByWithRelationInput = {
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

  async findById(id: number) {
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

  async findByUserAndSemester(userId: number, semesterId: number) {
    return this.prisma.studentSemesterScore.findUnique({
      where: {
        userId_semesterId: {
          userId,
          semesterId,
        },
      },
    });
  }

  async upsert(
    userId: number,
    semesterId: number,
    data: {
      gpa: number | null;
      maxBonusPoint: number;
      extendedGpa: number;
      conductScore: number | null;
      conductGrade: Grade | null;
      gpaGrade: Grade | null;
    },
  ) {
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
}
