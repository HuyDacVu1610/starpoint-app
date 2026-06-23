import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma, Grade } from '@prisma/client';
import * as xlsx from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoresRepository } from '../repositories/scores.repository';
import { QueryScoreDto } from '../dto/query-score.dto';
import { ScholarshipsService } from '../../scholarships/services/scholarships.service';

export function getGpaGrade(extendedGpa: number): Grade {
  if (extendedGpa >= 3.6) return Grade.EXCELLENT;
  if (extendedGpa >= 3.2) return Grade.GOOD;
  if (extendedGpa >= 2.5) return Grade.FAIR;
  if (extendedGpa >= 2.0) return Grade.AVERAGE;
  if (extendedGpa >= 1.0) return Grade.WEAK;
  return Grade.POOR;
}

export function getConductGrade(conductScore: number): Grade {
  if (conductScore >= 90) return Grade.EXCELLENT;
  if (conductScore >= 80) return Grade.GOOD;
  if (conductScore >= 70) return Grade.FAIR;
  if (conductScore >= 50) return Grade.AVERAGE;
  if (conductScore >= 30) return Grade.WEAK;
  return Grade.POOR;
}

@Injectable()
export class ScoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoresRepository: ScoresRepository,
    @Inject(forwardRef(() => ScholarshipsService))
    private readonly scholarshipsService: ScholarshipsService,
    @Inject('RABBITMQ_CLIENT')
    private readonly rabbitClient: ClientProxy,
  ) {}

  async findAll(query: QueryScoreDto) {
    return this.scoresRepository.findAll(query);
  }

  async findById(id: number) {
    const score = await this.scoresRepository.findById(id);
    if (!score) {
      throw new NotFoundException('Không tìm thấy điểm học kỳ của sinh viên');
    }
    return score;
  }

  async findByUserAndSemester(userId: number, semesterId: number) {
    return this.scoresRepository.findByUserAndSemester(userId, semesterId);
  }

  async importScores(semesterId: number, fileBuffer: Buffer) {
    // 1. Verify semester exists
    const semester = await this.prisma.semester.findUnique({
      where: { id: semesterId },
    });
    if (!semester) {
      throw new NotFoundException(`Học kỳ id ${semesterId} không tồn tại`);
    }

    // 2. Parse Excel
    let workbook: xlsx.WorkBook;
    try {
      workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    } catch {
      throw new BadRequestException(
        'File Excel không hợp lệ hoặc bị lỗi định dạng',
      );
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestException('File Excel trống');
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(worksheet);

    if (rows.length === 0) {
      throw new BadRequestException('File Excel không có dữ liệu');
    }

    // 3. Find Column Headers
    const firstRow = rows[0];
    const keys = Object.keys(firstRow);

    let studentCodeKey = '';
    let gpaKey = '';
    let conductScoreKey = '';

    for (const key of keys) {
      const normalized = key
        .toLowerCase()
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]/g, '');
      if (
        normalized.includes('studentcode') ||
        normalized.includes('mssv') ||
        normalized.includes('masinhvien') ||
        normalized.includes('code') ||
        normalized === 'sv'
      ) {
        studentCodeKey = key;
      } else if (
        normalized.includes('gpa') ||
        normalized.includes('diemtrungbinh') ||
        normalized.includes('diemtb') ||
        normalized === 'tb' ||
        normalized.includes('tbcht')
      ) {
        gpaKey = key;
      } else if (
        normalized.includes('conductscore') ||
        normalized.includes('diemrenluyen') ||
        normalized.includes('drl') ||
        normalized.includes('renluyen') ||
        normalized.includes('rl')
      ) {
        conductScoreKey = key;
      }
    }

    const missingHeaders: string[] = [];
    if (!studentCodeKey) missingHeaders.push('Mã sinh viên (MSSV)');
    if (!gpaKey) missingHeaders.push('Điểm GPA');
    if (!conductScoreKey) missingHeaders.push('Điểm rèn luyện');

    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `Không tìm thấy tiêu đề cột tương ứng trong file Excel: ${missingHeaders.join(', ')}`,
      );
    }

    const validationErrors: string[] = [];
    const studentCodeCountMap = new Map<string, number[]>();

    // 4. First Pass: Check for duplicates in the Excel file itself
    rows.forEach((row, index) => {
      const rowNum = index + 2;
      const rawCode = row[studentCodeKey];
      if (rawCode !== undefined && rawCode !== null) {
        const code = String(rawCode as any)
          .trim()
          .toUpperCase();
        if (code) {
          if (!studentCodeCountMap.has(code)) {
            studentCodeCountMap.set(code, []);
          }
          studentCodeCountMap.get(code)!.push(rowNum);
        }
      }
    });

    for (const [code, rowsList] of studentCodeCountMap.entries()) {
      if (rowsList.length > 1) {
        validationErrors.push(
          `Mã sinh viên "${code}" bị trùng lặp trong file Excel tại các dòng: ${rowsList.join(', ')}`,
        );
      }
    }

    // 5. Parse and validate row data
    const validParsedRows: Array<{
      studentCode: string;
      gpa: number;
      conductScore: number;
      rowNum: number;
    }> = [];

    rows.forEach((row, index) => {
      const rowNum = index + 2;
      const rawCode = row[studentCodeKey];
      const rawGpa = row[gpaKey];
      const rawConduct = row[conductScoreKey];

      // If checking duplicates already reported, still validate other bounds
      if (
        rawCode === undefined ||
        rawCode === null ||
        String(rawCode as any).trim() === ''
      ) {
        validationErrors.push(
          `Dòng ${rowNum}: Mã sinh viên không được để trống`,
        );
        return;
      }

      const studentCode = String(rawCode as any)
        .trim()
        .toUpperCase();
      const gpa = Number(rawGpa);
      const conductScore = Number(rawConduct);

      if (isNaN(gpa) || gpa < 0 || gpa > 4) {
        validationErrors.push(
          `Dòng ${rowNum}: Điểm GPA phải là số trong khoảng [0, 4]`,
        );
        return;
      }

      if (
        isNaN(conductScore) ||
        conductScore < 0 ||
        conductScore > 100 ||
        !Number.isInteger(conductScore)
      ) {
        validationErrors.push(
          `Dòng ${rowNum}: Điểm rèn luyện phải là số nguyên trong khoảng [0, 100]`,
        );
        return;
      }

      validParsedRows.push({
        studentCode,
        gpa,
        conductScore,
        rowNum,
      });
    });

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors);
    }

    // 6. Verify student codes exist in db
    const studentCodes = validParsedRows.map((r) => r.studentCode);
    const dbUsers = await this.prisma.user.findMany({
      where: {
        studentCode: { in: studentCodes },
        deletedAt: null,
      },
      select: {
        id: true,
        studentCode: true,
      },
    });

    const dbUserMap = new Map(dbUsers.map((u) => [u.studentCode, u.id]));

    validParsedRows.forEach((row) => {
      if (!dbUserMap.has(row.studentCode)) {
        validationErrors.push(
          `Dòng ${row.rowNum}: Sinh viên với mã "${row.studentCode}" không tồn tại trong hệ thống`,
        );
      }
    });

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors);
    }

    // 7. Perform updates in a single database transaction
    await this.prisma.$transaction(async (tx) => {
      for (const row of validParsedRows) {
        const userId = dbUserMap.get(row.studentCode)!;

        // Query max approved achievement bonus points for this user in this semester
        const achievements = await tx.achievement.findMany({
          where: {
            userId,
            semesterId,
            status: 'APPROVED',
          },
          select: {
            bonusPoint: true,
          },
        });

        const maxBonusPoint =
          achievements.length > 0
            ? Math.max(...achievements.map((a) => a.bonusPoint))
            : 0.0;

        const extendedGpa = Number((row.gpa + maxBonusPoint).toFixed(2));
        const gpaGrade = getGpaGrade(extendedGpa);
        const conductGrade = getConductGrade(row.conductScore);

        await tx.studentSemesterScore.upsert({
          where: {
            userId_semesterId: { userId, semesterId },
          },
          update: {
            gpa: row.gpa,
            maxBonusPoint,
            extendedGpa,
            conductScore: row.conductScore,
            gpaGrade,
            conductGrade,
          },
          create: {
            userId,
            semesterId,
            gpa: row.gpa,
            maxBonusPoint,
            extendedGpa,
            conductScore: row.conductScore,
            gpaGrade,
            conductGrade,
          },
        });

        // Trigger scholarship candidate recheck
        await this.scholarshipsService.reevaluateCandidate(
          userId,
          semesterId,
          tx,
        );
      }
    });

    this.rabbitClient.emit('bonus.calculated', { semesterId });

    return {
      success: true,
      message: `Đã import thành công bảng điểm cho ${validParsedRows.length} sinh viên`,
    };
  }

  async updateManualScore(
    semesterId: number,
    studentCode: string,
    dto: { gpa?: number; conductScore?: number },
  ) {
    // 1. Verify user exists
    const user = await this.prisma.user.findFirst({
      where: { studentCode: studentCode.toUpperCase(), deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException(
        `Sinh viên mã "${studentCode}" không tồn tại`,
      );
    }

    // 2. Fetch existing score
    const existingScore = await this.scoresRepository.findByUserAndSemester(
      user.id,
      semesterId,
    );
    if (!existingScore) {
      throw new NotFoundException(
        `Không tìm thấy bản ghi điểm của sinh viên ${studentCode} trong học kỳ này. Vui lòng import Excel trước.`,
      );
    }

    // 3. Update parameters
    const newGpa = dto.gpa !== undefined ? dto.gpa : existingScore.gpa;
    const newConductScore =
      dto.conductScore !== undefined
        ? dto.conductScore
        : existingScore.conductScore;

    if (newGpa < 0 || newGpa > 4) {
      throw new BadRequestException('Điểm GPA phải nằm trong khoảng [0, 4]');
    }
    if (newConductScore < 0 || newConductScore > 100) {
      throw new BadRequestException(
        'Điểm rèn luyện phải nằm trong khoảng [0, 100]',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Re-query approved achievements in this semester
      const achievements = await tx.achievement.findMany({
        where: {
          userId: user.id,
          semesterId,
          status: 'APPROVED',
        },
        select: {
          bonusPoint: true,
        },
      });

      const maxBonusPoint =
        achievements.length > 0
          ? Math.max(...achievements.map((a) => a.bonusPoint))
          : 0.0;

      const extendedGpa = Number((newGpa + maxBonusPoint).toFixed(2));
      const gpaGrade = getGpaGrade(extendedGpa);
      const conductGrade = getConductGrade(newConductScore);

      const updatedScore = await tx.studentSemesterScore.update({
        where: {
          userId_semesterId: { userId: user.id, semesterId },
        },
        data: {
          gpa: newGpa,
          maxBonusPoint,
          extendedGpa,
          conductScore: newConductScore,
          gpaGrade,
          conductGrade,
        },
      });

      // Trigger scholarship candidate recheck
      await this.scholarshipsService.reevaluateCandidate(
        user.id,
        semesterId,
        tx,
      );

      return updatedScore;
    });

    this.rabbitClient.emit('bonus.calculated', { semesterId });
    return result;
  }

  async recalculateScore(
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
      return;
    }

    // Fetch approved achievements
    const achievements = await prismaClient.achievement.findMany({
      where: {
        userId,
        semesterId,
        status: 'APPROVED',
      },
      select: {
        bonusPoint: true,
      },
    });

    const maxBonusPoint =
      achievements.length > 0
        ? Math.max(...achievements.map((a) => a.bonusPoint))
        : 0.0;

    const extendedGpa = Number((score.gpa + maxBonusPoint).toFixed(2));
    const gpaGrade = getGpaGrade(extendedGpa);

    await prismaClient.studentSemesterScore.update({
      where: {
        userId_semesterId: { userId, semesterId },
      },
      data: {
        maxBonusPoint,
        extendedGpa,
        gpaGrade,
      },
    });

    // Recalculate scholarship candidate
    await this.scholarshipsService.reevaluateCandidate(
      userId,
      semesterId,
      prismaClient,
    );

    this.rabbitClient.emit('bonus.calculated', { semesterId });
  }

  async calculateScoresForSemester(semesterId: number) {
    const semester = await this.prisma.semester.findUnique({
      where: { id: semesterId },
    });
    if (!semester) {
      throw new NotFoundException(`Học kỳ id ${semesterId} không tồn tại`);
    }

    const scores = await this.prisma.studentSemesterScore.findMany({
      where: { semesterId },
      select: { userId: true },
    });

    await this.prisma.$transaction(async (tx) => {
      for (const score of scores) {
        await this.recalculateScore(score.userId, semesterId, tx);
      }
    });

    this.rabbitClient.emit('bonus.calculated', { semesterId });

    return {
      success: true,
      message: `Đã tính toán lại điểm thưởng cho ${scores.length} sinh viên`,
    };
  }
}
