import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma, Grade, AchievementRank, AchievementCategory } from '@prisma/client';
import * as xlsx from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoresRepository } from '../repositories/scores.repository';
import { QueryScoreDto } from '../dto/query-score.dto';
import { ScholarshipsService } from '../../scholarships/services/scholarships.service';
import { BONUS_POINT_MAP } from '../../achievements/constants/bonus-point-map';
import { hash } from '../../shared/common/utils/crypto.util';

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

    // 1.1 Verify active semester
    const now = new Date();
    let activeSemester = await this.prisma.semester.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
    if (!activeSemester) {
      activeSemester = await this.prisma.semester.findFirst({
        orderBy: { endDate: 'desc' },
      });
    }

    if (!activeSemester || semesterId !== activeSemester.id) {
      throw new BadRequestException('Chỉ được phép nhập điểm từ Excel cho học kỳ hiện tại');
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
    let competitionNameKey = '';
    let achievementRankKey = '';
    let fullNameKey = '';
    let emailKey = '';

    for (const key of keys) {
      const normalized = key
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
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
      } else if (
        normalized.includes('competition') ||
        normalized.includes('cuocthi') ||
        normalized.includes('tencuocthi')
      ) {
        competitionNameKey = key;
      } else if (
        normalized.includes('rank') ||
        normalized.includes('award') ||
        normalized.includes('giaithuong') ||
        normalized.includes('giai')
      ) {
        achievementRankKey = key;
      } else if (
        normalized.includes('fullname') ||
        normalized.includes('hoten') ||
        normalized.includes('hovaten') ||
        normalized.includes('name') ||
        normalized === 'ten'
      ) {
        fullNameKey = key;
      } else if (
        normalized.includes('email') ||
        normalized.includes('gmail') ||
        normalized === 'mail'
      ) {
        emailKey = key;
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
    const emailRowsMap = new Map<string, number[]>();

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

      if (emailKey) {
        const rawEmail = row[emailKey];
        if (rawEmail !== undefined && rawEmail !== null) {
          const email = String(rawEmail as any).trim().toLowerCase();
          if (email) {
            if (!emailRowsMap.has(email)) {
              emailRowsMap.set(email, []);
            }
            emailRowsMap.get(email)!.push(rowNum);
          }
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

    for (const [email, rowsList] of emailRowsMap.entries()) {
      if (rowsList.length > 1) {
        validationErrors.push(
          `Email "${email}" bị trùng lặp trong file Excel tại các dòng: ${rowsList.join(', ')}`,
        );
      }
    }

    // 5. Parse and validate row data
    const validParsedRows: Array<{
      studentCode: string;
      fullName?: string;
      email?: string;
      gpa: number;
      conductScore: number;
      competitionName?: string;
      achievementRank?: string;
      rowNum: number;
    }> = [];

    rows.forEach((row, index) => {
      const rowNum = index + 2;
      const rawCode = row[studentCodeKey];
      const rawGpa = row[gpaKey];
      const rawConduct = row[conductScoreKey];
      const rawComp = competitionNameKey ? row[competitionNameKey] : undefined;
      const rawRank = achievementRankKey ? row[achievementRankKey] : undefined;
      const rawFullName = fullNameKey ? row[fullNameKey] : undefined;
      const rawEmail = emailKey ? row[emailKey] : undefined;

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
      const competitionName = rawComp ? String(rawComp).trim() : undefined;
      const achievementRank = rawRank ? String(rawRank).trim() : undefined;
      const fullName = rawFullName ? String(rawFullName).trim() : undefined;
      const email = rawEmail ? String(rawEmail).trim() : undefined;

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
        fullName,
        email,
        gpa,
        conductScore,
        competitionName,
        achievementRank,
        rowNum,
      });
    });

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors);
    }

    // 6. Verify student codes exist in db, or validate for auto-creation
    const studentCodes = validParsedRows.map((r) => r.studentCode);
    const dbUsers = await this.prisma.user.findMany({
      where: {
        studentCode: { in: studentCodes },
      },
      select: {
        id: true,
        studentCode: true,
      },
    });

    const dbUserMap = new Map(dbUsers.map((u) => [u.studentCode, u.id]));

    // Query all emails in the system to verify uniqueness
    const emailsToCheck = validParsedRows
      .map((r) => r.email)
      .filter((email): email is string => !!email);

    const dbUsersByEmail = await this.prisma.user.findMany({
      where: {
        email: { in: emailsToCheck },
      },
      select: {
        studentCode: true,
        email: true,
      },
    });

    const dbEmailMap = new Map(
      dbUsersByEmail.map((u) => [u.email.toLowerCase(), u.studentCode]),
    );

    // Fetch semester competitions to validate names
    const semesterComps = await this.prisma.competition.findMany({
      where: { semesterId },
    });
    const compNamesSet = new Set(
      semesterComps.map((c) => c.name.toLowerCase().trim().replace(/\s+/g, ' ')),
    );

    validParsedRows.forEach((row) => {
      // Validate competition and achievement rank consistency
      if (row.competitionName && !row.achievementRank) {
        validationErrors.push(
          `Dòng ${row.rowNum}: Điền tên cuộc thi "${row.competitionName}" nhưng chưa nhập hạng giải thưởng.`,
        );
      } else if (!row.competitionName && row.achievementRank) {
        validationErrors.push(
          `Dòng ${row.rowNum}: Có hạng giải thưởng "${row.achievementRank}" nhưng chưa nhập tên cuộc thi.`,
        );
      }

      // Validate competition exists if provided
      if (row.competitionName) {
        const normName = row.competitionName.toLowerCase().trim().replace(/\s+/g, ' ');
        if (!compNamesSet.has(normName)) {
          validationErrors.push(
            `Dòng ${row.rowNum}: Cuộc thi "${row.competitionName}" không tồn tại trong học kỳ này trên hệ thống. Vui lòng tạo cuộc thi trước khi import.`,
          );
        }
      }

      const hasUser = dbUserMap.has(row.studentCode);
      if (!hasUser) {
        // Must have fullName and email to auto-create
        if (!row.fullName || !row.email) {
          validationErrors.push(
            `Dòng ${row.rowNum}: Sinh viên với mã "${row.studentCode}" chưa tồn tại trong hệ thống. File Excel cần có cột "Họ tên" và "Email" để tự động tạo tài khoản.`,
          );
          return;
        }

        // Must not conflict with existing email
        const emailLower = row.email.toLowerCase();
        if (dbEmailMap.has(emailLower)) {
          const existingStudentCode = dbEmailMap.get(emailLower)!;
          if (existingStudentCode !== row.studentCode) {
            validationErrors.push(
              `Dòng ${row.rowNum}: Email "${row.email}" đã được đăng ký bởi sinh viên khác (mã "${existingStudentCode}").`,
            );
          }
        }
      }
    });

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors);
    }

    let createdUsersCount = 0;
    let createdScoresCount = 0;
    let updatedScoresCount = 0;

    // 7. Perform updates in a single database transaction
    await this.prisma.$transaction(async (tx) => {
      // Fetch STUDENT role
      const studentRole = await tx.role.findUnique({
        where: { name: 'STUDENT' },
      });
      if (!studentRole) {
        throw new NotFoundException('Vai trò STUDENT không tồn tại trong hệ thống');
      }

      // 7.1 Fetch competitions map for the current semester
      const compMap = new Map<string, any>();
      const hasCompetitionData = validParsedRows.some((r) => r.competitionName && r.achievementRank);
      if (hasCompetitionData) {
        const semesterComps = await tx.competition.findMany({
          where: { semesterId },
        });
        semesterComps.forEach((c) => {
          const normName = c.name.toLowerCase().trim().replace(/\s+/g, ' ');
          compMap.set(normName, c);
        });
      }

      for (const row of validParsedRows) {
        let userId = dbUserMap.get(row.studentCode);

        // If user doesn't exist, auto-create
        if (!userId) {
          const passwordHash = await hash('password123');
          const newUser = await tx.user.create({
            data: {
              studentCode: row.studentCode,
              fullName: row.fullName!,
              email: row.email!,
              password: passwordHash,
              userRoles: {
                create: {
                  roleId: studentRole.id,
                },
              },
            },
          });
          userId = newUser.id;
          dbUserMap.set(row.studentCode, userId); // Add to map
          createdUsersCount++;
        }

        // 7.2 Process optional competition achievement
        if (row.competitionName && row.achievementRank) {
          const normName = row.competitionName.toLowerCase().trim().replace(/\s+/g, ' ');
          const comp = compMap.get(normName);
          if (comp) {
            // Parse rank from Vietnamese strings
            const rankStr = row.achievementRank.toLowerCase();
            let rank: AchievementRank = AchievementRank.NONE;

            if (
              rankStr.includes('nhất') ||
              rankStr.includes('nhut') ||
              rankStr.includes('hcv') ||
              rankStr.includes('vàng') ||
              rankStr.includes('first')
            ) {
              rank = AchievementRank.FIRST;
            } else if (
              rankStr.includes('nhì') ||
              rankStr.includes('hcb') ||
              rankStr.includes('bạc') ||
              rankStr.includes('second')
            ) {
              rank = AchievementRank.SECOND;
            } else if (
              rankStr.includes('ba') ||
              rankStr.includes('hcđ') ||
              rankStr.includes('đồng') ||
              rankStr.includes('third')
            ) {
              rank = AchievementRank.THIRD;
            }

            const category =
              comp.level === 'CENTRAL'
                ? AchievementCategory.CENTRAL_COMPETITION
                : AchievementCategory.ACADEMY_COMPETITION;

            const bonusPoint = BONUS_POINT_MAP[category][rank];

            // Upsert achievement
            const existingAch = await tx.achievement.findFirst({
              where: {
                userId,
                semesterId,
                competitionId: comp.id,
              },
            });

            if (existingAch) {
              await tx.achievement.update({
                where: { id: existingAch.id },
                data: {
                  rank,
                  bonusPoint,
                  status: 'APPROVED',
                },
              });
            } else {
              await tx.achievement.create({
                data: {
                  userId,
                  semesterId,
                  competitionId: comp.id,
                  category,
                  rank,
                  bonusPoint,
                  status: 'APPROVED',
                  note: 'Được tạo tự động khi import từ file Excel',
                },
              });
            }
          }
        }

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

        const existingScore = await tx.studentSemesterScore.findUnique({
          where: {
            userId_semesterId: { userId, semesterId },
          },
        });

        if (existingScore) {
          updatedScoresCount++;
        } else {
          createdScoresCount++;
        }

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
      message: `Đã import thành công bảng điểm cho ${validParsedRows.length} sinh viên: Tạo mới ${createdUsersCount} tài khoản, nhập mới điểm cho ${createdScoresCount} sinh viên và cập nhật đè điểm cho ${updatedScoresCount} sinh viên.`,
    };
  }

  async updateManualScore(
    semesterId: number,
    studentCode: string,
    dto: { gpa?: number; conductScore?: number; competitionId?: number; rank?: AchievementRank; category?: AchievementCategory },
  ) {
    // 0. Verify active semester
    const now = new Date();
    let activeSemester = await this.prisma.semester.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
    if (!activeSemester) {
      activeSemester = await this.prisma.semester.findFirst({
        orderBy: { endDate: 'desc' },
      });
    }

    if (!activeSemester || semesterId !== activeSemester.id) {
      throw new BadRequestException('Chỉ được phép cập nhật điểm thủ công cho học kỳ hiện tại');
    }

    // 1. Verify user exists
    const user = await this.prisma.user.findFirst({
      where: { studentCode: studentCode.toUpperCase() },
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

    // 3. Update parameters
    const newGpa = dto.gpa !== undefined ? dto.gpa : (existingScore ? existingScore.gpa : null);
    const newConductScore =
      dto.conductScore !== undefined
        ? dto.conductScore
        : (existingScore ? existingScore.conductScore : null);

    if (newGpa !== null && (newGpa < 0 || newGpa > 4)) {
      throw new BadRequestException('Điểm GPA phải nằm trong khoảng [0, 4]');
    }
    if (newConductScore !== null && (newConductScore < 0 || newConductScore > 100)) {
      throw new BadRequestException(
        'Điểm rèn luyện phải nằm trong khoảng [0, 100]',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 3.1. Delete all existing manual achievements for this student in this semester to avoid accumulation and allow updates
      await tx.achievement.deleteMany({
        where: {
          userId: user.id,
          semesterId,
          note: 'Được tạo tự động khi cập nhật điểm thủ công',
        },
      });

      // 3.2. If rank OR category is provided, create the new manual Achievement record
      if (dto.rank || dto.category) {
        let category: AchievementCategory;
        let competitionId: number | null = null;
        const rank = dto.rank || AchievementRank.NONE;

        if (dto.competitionId) {
          // Verify competition exists
          const competition = await tx.competition.findUnique({
            where: { id: dto.competitionId },
          });
          if (!competition) {
            throw new NotFoundException(`Cuộc thi ID ${dto.competitionId} không tồn tại`);
          }
          if (competition.semesterId !== semesterId) {
            throw new BadRequestException('Cuộc thi phải thuộc về học kỳ được chọn');
          }

          competitionId = dto.competitionId;
          category =
            competition.level === 'CENTRAL'
              ? AchievementCategory.CENTRAL_COMPETITION
              : AchievementCategory.ACADEMY_COMPETITION;
        } else {
          // If no competition is selected, rank MUST be NONE (participation/other)
          if (rank !== AchievementRank.NONE) {
            throw new BadRequestException('Các giải thưởng Nhất, Nhì, Ba yêu cầu phải chọn cuộc thi liên kết');
          }
          // Default or use provided category (ORGANIZATION_PARTICIPATION or SPECIAL_ACHIEVEMENT)
          category = dto.category || AchievementCategory.ORGANIZATION_PARTICIPATION;
        }

        const bonusPoint = BONUS_POINT_MAP[category][rank];

        await tx.achievement.create({
          data: {
            userId: user.id,
            semesterId,
            competitionId,
            category,
            rank,
            bonusPoint,
            status: 'APPROVED',
            note: 'Được tạo tự động khi cập nhật điểm thủ công',
          },
        });
      }

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

      const extendedGpa = Number(((newGpa ?? 0.0) + maxBonusPoint).toFixed(2));
      const gpaGrade = newGpa !== null ? getGpaGrade(extendedGpa) : null;
      const conductGrade = newConductScore !== null ? getConductGrade(newConductScore) : null;

      const updatedScore = await tx.studentSemesterScore.upsert({
        where: {
          userId_semesterId: { userId: user.id, semesterId },
        },
        update: {
          gpa: newGpa,
          maxBonusPoint,
          extendedGpa,
          conductScore: newConductScore,
          gpaGrade,
          conductGrade,
        },
        create: {
          userId: user.id,
          semesterId,
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
    let score = await prismaClient.studentSemesterScore.findUnique({
      where: {
        userId_semesterId: { userId, semesterId },
      },
    });

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

    if (!score) {
      if (achievements.length === 0) {
        return;
      }

      // Create a new record with null base GPA and conduct score, but calculate maxBonusPoint & extendedGpa
      const extendedGpa = maxBonusPoint;
      await prismaClient.studentSemesterScore.create({
        data: {
          userId,
          semesterId,
          gpa: null,
          conductScore: null,
          maxBonusPoint,
          extendedGpa,
          gpaGrade: null,
          conductGrade: null,
        },
      });
    } else {
      const baseGpa = score.gpa ?? 0.0;
      const extendedGpa = Number((baseGpa + maxBonusPoint).toFixed(2));
      const gpaGrade = score.gpa !== null ? getGpaGrade(extendedGpa) : null;

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
    }

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
