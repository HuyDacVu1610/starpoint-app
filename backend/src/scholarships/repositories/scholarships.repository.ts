import { Injectable } from '@nestjs/common';
import { Prisma, Grade } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryCandidateDto } from '../dto/query-candidate.dto';

@Injectable()
export class ScholarshipsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryCandidateDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ScholarshipCandidateWhereInput = {};

    if (query.semesterId) {
      where.semesterId = query.semesterId;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.isEligible !== undefined) {
      where.isEligible = query.isEligible;
    }

    if (query.scholarshipTier) {
      where.scholarshipTier = query.scholarshipTier;
    }

    if (query.search) {
      where.user = {
        OR: [
          { studentCode: { contains: query.search } },
          { fullName: { contains: query.search } },
        ],
      };
    }

    const sortBy = query.sortBy || 'extendedGpa';
    const sortOrder = (query.sortOrder || 'desc').toLowerCase() as
      | 'asc'
      | 'desc';

    let orderBy: Prisma.ScholarshipCandidateOrderByWithRelationInput = {
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
      this.prisma.scholarshipCandidate.count({ where }),
      this.prisma.scholarshipCandidate.findMany({
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
              semesterScores: {
                where: {
                  semesterId: query.semesterId || undefined,
                },
                select: {
                  gpa: true,
                  conductScore: true,
                },
              },
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
    return this.prisma.scholarshipCandidate.findUnique({
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
    return this.prisma.scholarshipCandidate.findFirst({
      where: {
        userId,
        semesterId,
      },
    });
  }

  async upsert(
    userId: number,
    semesterId: number,
    data: {
      extendedGpa: number;
      conductGrade: Grade;
      gpaGrade: Grade;
      isEligible: boolean;
      scholarshipTier: Grade | null;
      note?: string | null;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const prismaClient = tx || this.prisma;

    // Find if a candidate record already exists
    const existing = await prismaClient.scholarshipCandidate.findFirst({
      where: {
        userId,
        semesterId,
      },
    });

    if (existing) {
      return prismaClient.scholarshipCandidate.update({
        where: { id: existing.id },
        data,
      });
    }

    return prismaClient.scholarshipCandidate.create({
      data: {
        userId,
        semesterId,
        ...data,
      },
    });
  }
}
