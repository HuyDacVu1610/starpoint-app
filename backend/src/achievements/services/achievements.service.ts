import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AchievementsRepository } from '../repositories/achievements.repository';
import { SemestersService } from '../../semesters/services/semesters.service';
import { CompetitionsService } from '../../competitions/services/competitions.service';
import { UsersService } from '../../users/services/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAchievementDto } from '../dto/create-achievement.dto';
import { UpdateAchievementDto } from '../dto/update-achievement.dto';
import { QueryAchievementDto } from '../dto/query-achievement.dto';
import { BONUS_POINT_MAP } from '../constants/bonus-point-map';
import { AchievementCategory, AchievementStatus } from '@starpointapp/shared';

@Injectable()
export class AchievementsService {
  constructor(
    private readonly achievementsRepository: AchievementsRepository,
    private readonly semestersService: SemestersService,
    private readonly competitionsService: CompetitionsService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query: QueryAchievementDto) {
    return this.achievementsRepository.findAll(query);
  }

  async findById(id: number, reqUser: { id: number; roles: string[] }) {
    const achievement = await this.achievementsRepository.findById(id);
    if (!achievement) {
      throw new NotFoundException('Thành tích không tồn tại');
    }

    // Students can only view their own achievements
    if (
      reqUser.roles.includes('STUDENT') &&
      achievement.userId !== reqUser.id
    ) {
      throw new ForbiddenException('Bạn không có quyền xem thành tích này');
    }

    return achievement;
  }

  async create(
    dto: CreateAchievementDto,
    reqUser: { id: number; roles: string[] },
  ) {
    const isStudent = reqUser.roles.includes('STUDENT');

    // Determine target userId
    let targetUserId: number;
    if (isStudent) {
      targetUserId = reqUser.id;
    } else {
      if (!dto.userId) {
        throw new BadRequestException('ID sinh viên không được để trống');
      }
      targetUserId = dto.userId;
    }

    // Validate that the user (student) exists
    await this.usersService.findById(targetUserId);

    // Validate semester exists
    await this.semestersService.findById(dto.semesterId);

    // Validate category and competitionId constraint
    if (
      (dto.category as string) ===
        (AchievementCategory.CENTRAL_COMPETITION as string) ||
      (dto.category as string) ===
        (AchievementCategory.ACADEMY_COMPETITION as string)
    ) {
      if (!dto.competitionId) {
        throw new BadRequestException(
          'Mục thành tích cuộc thi yêu cầu phải chọn cuộc thi liên kết',
        );
      }
      // Validate competition exists
      const comp = await this.competitionsService.findById(dto.competitionId);
      if (comp.semesterId !== dto.semesterId) {
        throw new BadRequestException(
          'Cuộc thi phải thuộc về học kỳ được chọn',
        );
      }
    }

    // Validate evidenceFileId exists if provided
    if (dto.evidenceFileId) {
      const file = await this.prisma.uploadedFile.findUnique({
        where: { id: dto.evidenceFileId },
      });
      if (!file) {
        throw new BadRequestException('File minh chứng không tồn tại');
      }
    }

    // Auto-calculate points
    const bonusPoint = BONUS_POINT_MAP[dto.category][dto.rank];

    // Determine status
    let status = AchievementStatus.PENDING;
    if (!isStudent) {
      status = dto.status || AchievementStatus.APPROVED;
    }

    return this.achievementsRepository.create({
      userId: targetUserId,
      competitionId: dto.competitionId || null,
      semesterId: dto.semesterId,
      category: dto.category,
      rank: dto.rank,
      bonusPoint,
      evidenceFileId: dto.evidenceFileId || null,
      note: dto.note || null,
      status,
    });
  }

  async update(
    id: number,
    dto: UpdateAchievementDto,
    reqUser: { id: number; roles: string[] },
  ) {
    const current = await this.achievementsRepository.findById(id);
    if (!current) {
      throw new NotFoundException('Thành tích không tồn tại');
    }

    const isStudent = reqUser.roles.includes('STUDENT');

    // Access control check for Student
    if (isStudent) {
      if (current.userId !== reqUser.id) {
        throw new ForbiddenException(
          'Bạn không có quyền chỉnh sửa thành tích này',
        );
      }
      if (
        (current.status as string) !== (AchievementStatus.PENDING as string)
      ) {
        throw new BadRequestException(
          'Không thể chỉnh sửa thành tích đã được xử lý (APPROVED/REJECTED)',
        );
      }
    }

    // Gather final fields
    const finalUserId = isStudent
      ? reqUser.id
      : dto.userId !== undefined
        ? dto.userId
        : current.userId;
    const finalSemesterId =
      dto.semesterId !== undefined ? dto.semesterId : current.semesterId;
    const finalCategory =
      dto.category !== undefined ? dto.category : current.category;
    const finalRank = dto.rank !== undefined ? dto.rank : current.rank;
    const finalCompetitionId =
      dto.competitionId !== undefined
        ? dto.competitionId
        : current.competitionId;
    const finalEvidenceFileId =
      dto.evidenceFileId !== undefined
        ? dto.evidenceFileId
        : current.evidenceFileId;

    // Validate user exists if modified
    if (finalUserId !== current.userId) {
      await this.usersService.findById(finalUserId);
    }

    // Validate semester exists if modified
    if (finalSemesterId !== current.semesterId) {
      await this.semestersService.findById(finalSemesterId);
    }

    // Validate competitionId relationship if modified or required
    if (
      (finalCategory as string) ===
        (AchievementCategory.CENTRAL_COMPETITION as string) ||
      (finalCategory as string) ===
        (AchievementCategory.ACADEMY_COMPETITION as string)
    ) {
      if (!finalCompetitionId) {
        throw new BadRequestException(
          'Mục thành tích cuộc thi yêu cầu phải chọn cuộc thi liên kết',
        );
      }
      const comp = await this.competitionsService.findById(finalCompetitionId);
      if (comp.semesterId !== finalSemesterId) {
        throw new BadRequestException(
          'Cuộc thi phải thuộc về học kỳ được chọn',
        );
      }
    }

    // Validate evidenceFileId exists if modified
    if (finalEvidenceFileId && finalEvidenceFileId !== current.evidenceFileId) {
      const file = await this.prisma.uploadedFile.findUnique({
        where: { id: finalEvidenceFileId },
      });
      if (!file) {
        throw new BadRequestException('File minh chứng không tồn tại');
      }
    }

    // Recalculate bonus point if category or rank changed
    let bonusPoint = current.bonusPoint;
    if (dto.category !== undefined || dto.rank !== undefined) {
      bonusPoint = BONUS_POINT_MAP[finalCategory][finalRank];
    }

    // Determine final status
    let finalStatus = current.status;
    if (isStudent) {
      finalStatus = AchievementStatus.PENDING; // Always reset to pending on student edits
    } else if (dto.status !== undefined) {
      finalStatus = dto.status;
    }

    return this.achievementsRepository.update(id, {
      userId: finalUserId,
      competitionId: finalCompetitionId || null,
      semesterId: finalSemesterId,
      category: finalCategory,
      rank: finalRank,
      bonusPoint,
      evidenceFileId: finalEvidenceFileId || null,
      note: dto.note !== undefined ? dto.note : current.note,
      status: finalStatus,
    });
  }

  async delete(id: number, reqUser: { id: number; roles: string[] }) {
    const current = await this.achievementsRepository.findById(id);
    if (!current) {
      throw new NotFoundException('Thành tích không tồn tại');
    }

    const isStudent = reqUser.roles.includes('STUDENT');

    if (isStudent) {
      if (current.userId !== reqUser.id) {
        throw new ForbiddenException('Bạn không có quyền xoá thành tích này');
      }
      if (
        (current.status as string) !== (AchievementStatus.PENDING as string)
      ) {
        throw new BadRequestException(
          'Không thể xoá thành tích đã được xử lý (APPROVED/REJECTED)',
        );
      }
    }

    return this.achievementsRepository.delete(id);
  }

  async review(id: number, status: AchievementStatus) {
    const current = await this.achievementsRepository.findById(id);
    if (!current) {
      throw new NotFoundException('Thành tích không tồn tại');
    }
    return this.achievementsRepository.update(id, { status });
  }
}
