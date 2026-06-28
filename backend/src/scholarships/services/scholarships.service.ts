import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma, Grade } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ScholarshipsRepository } from '../repositories/scholarships.repository';
import { QueryCandidateDto } from '../dto/query-candidate.dto';

export function calculateScholarship(
  gpaGrade: Grade | null,
  conductGrade: Grade | null,
): { isEligible: boolean; scholarshipTier: Grade | null; note: string } {
  if (!gpaGrade || !conductGrade) {
    return {
      isEligible: false,
      scholarshipTier: null,
      note: 'Chưa có đầy đủ thông tin xếp loại GPA học tập hoặc xếp loại rèn luyện',
    };
  }

  const isGpaEligible =
    gpaGrade === Grade.EXCELLENT ||
    gpaGrade === Grade.GOOD ||
    gpaGrade === Grade.FAIR;

  const isConductEligible =
    conductGrade === Grade.EXCELLENT ||
    conductGrade === Grade.GOOD ||
    conductGrade === Grade.FAIR;

  if (!isGpaEligible || !isConductEligible) {
    return {
      isEligible: false,
      scholarshipTier: null,
      note: 'Không đủ điều kiện (GPA mở rộng hoặc Điểm rèn luyện dưới loại Khá)',
    };
  }

  // Xuất sắc (EXCELLENT): GPA Xuất sắc AND Điểm rèn luyện Xuất sắc
  if (gpaGrade === Grade.EXCELLENT && conductGrade === Grade.EXCELLENT) {
    return {
      isEligible: true,
      scholarshipTier: Grade.EXCELLENT,
      note: 'Đủ điều kiện nhận học bổng loại Xuất sắc',
    };
  }

  // Giỏi (GOOD): GPA >= Giỏi AND Điểm rèn luyện >= Tốt (GOOD), excluding Xuất sắc
  const isGpaGoodOrHigher =
    gpaGrade === Grade.EXCELLENT || gpaGrade === Grade.GOOD;
  const isConductGoodOrHigher =
    conductGrade === Grade.EXCELLENT || conductGrade === Grade.GOOD;
  if (isGpaGoodOrHigher && isConductGoodOrHigher) {
    return {
      isEligible: true,
      scholarshipTier: Grade.GOOD,
      note: 'Đủ điều kiện nhận học bổng loại Giỏi',
    };
  }

  // Khá (FAIR): Cả 2 đều ít nhất loại Khá (FAIR)
  return {
    isEligible: true,
    scholarshipTier: Grade.FAIR,
    note: 'Đủ điều kiện nhận học bổng loại Khá',
  };
}

@Injectable()
export class ScholarshipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scholarshipsRepository: ScholarshipsRepository,
    @Inject('RABBITMQ_CLIENT')
    private readonly rabbitClient: ClientProxy,
  ) {}

  async findAll(query: QueryCandidateDto) {
    return this.scholarshipsRepository.findAll(query);
  }

  async findByUserAndSemester(userId: number, semesterId: number) {
    return this.scholarshipsRepository.findByUserAndSemester(
      userId,
      semesterId,
    );
  }

  async evaluateScholarships(semesterId: number) {
    // 1. Verify semester exists
    const semester = await this.prisma.semester.findUnique({
      where: { id: semesterId },
    });
    if (!semester) {
      throw new NotFoundException(`Học kỳ id ${semesterId} không tồn tại`);
    }

    // 2. Fetch all scores for this semester
    const scores = await this.prisma.studentSemesterScore.findMany({
      where: { semesterId },
    });

    let evaluatedCount = 0;
    let eligibleCount = 0;
    const tierCounts = {
      EXCELLENT: 0,
      GOOD: 0,
      FAIR: 0,
    };

    await this.prisma.$transaction(async (tx) => {
      for (const score of scores) {
        const evalResult = calculateScholarship(
          score.gpaGrade,
          score.conductGrade,
        );

        await this.scholarshipsRepository.upsert(
          score.userId,
          semesterId,
          {
            extendedGpa: score.extendedGpa,
            conductGrade: score.conductGrade,
            gpaGrade: score.gpaGrade,
            isEligible: evalResult.isEligible,
            scholarshipTier: evalResult.scholarshipTier,
            note: evalResult.note,
          },
          tx,
        );

        evaluatedCount++;
        if (evalResult.isEligible) {
          eligibleCount++;
          if (evalResult.scholarshipTier) {
            tierCounts[
              evalResult.scholarshipTier as 'EXCELLENT' | 'GOOD' | 'FAIR'
            ]++;
          }
        }
      }
    });

    // Emit RabbitMQ Event
    this.rabbitClient.emit('scholarship.evaluated', {
      semesterId,
      evaluatedCount,
      eligibleCount,
      tierCounts,
    });

    return {
      evaluatedCount,
      eligibleCount,
      tierCounts,
    };
  }

  async reevaluateCandidate(
    userId: number,
    semesterId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const prismaClient = tx || this.prisma;

    // Check if score record exists
    const score = await prismaClient.studentSemesterScore.findUnique({
      where: {
        userId_semesterId: { userId, semesterId },
      },
    });

    if (!score) {
      // If score doesn't exist, we can delete the candidate record if it exists
      const existing = await prismaClient.scholarshipCandidate.findFirst({
        where: { userId, semesterId },
      });
      if (existing) {
        await prismaClient.scholarshipCandidate.delete({
          where: { id: existing.id },
        });
      }
      return;
    }

    const evalResult = calculateScholarship(score.gpaGrade, score.conductGrade);

    await this.scholarshipsRepository.upsert(
      userId,
      semesterId,
      {
        extendedGpa: score.extendedGpa,
        conductGrade: score.conductGrade,
        gpaGrade: score.gpaGrade,
        isEligible: evalResult.isEligible,
        scholarshipTier: evalResult.scholarshipTier,
        note: evalResult.note,
      },
      prismaClient,
    );
  }
}

