"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementsService = void 0;
const common_1 = require("@nestjs/common");
const achievements_repository_1 = require("../repositories/achievements.repository");
const semesters_service_1 = require("../../semesters/services/semesters.service");
const competitions_service_1 = require("../../competitions/services/competitions.service");
const users_service_1 = require("../../users/services/users.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const bonus_point_map_1 = require("../constants/bonus-point-map");
const shared_1 = require("@starpointapp/shared");
let AchievementsService = class AchievementsService {
    achievementsRepository;
    semestersService;
    competitionsService;
    usersService;
    prisma;
    constructor(achievementsRepository, semestersService, competitionsService, usersService, prisma) {
        this.achievementsRepository = achievementsRepository;
        this.semestersService = semestersService;
        this.competitionsService = competitionsService;
        this.usersService = usersService;
        this.prisma = prisma;
    }
    async findAll(query) {
        return this.achievementsRepository.findAll(query);
    }
    async findById(id, reqUser) {
        const achievement = await this.achievementsRepository.findById(id);
        if (!achievement) {
            throw new common_1.NotFoundException('Thành tích không tồn tại');
        }
        if (reqUser.roles.includes('STUDENT') &&
            achievement.userId !== reqUser.id) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem thành tích này');
        }
        return achievement;
    }
    async create(dto, reqUser) {
        const isStudent = reqUser.roles.includes('STUDENT');
        let targetUserId;
        if (isStudent) {
            targetUserId = reqUser.id;
        }
        else {
            if (!dto.userId) {
                throw new common_1.BadRequestException('ID sinh viên không được để trống');
            }
            targetUserId = dto.userId;
        }
        await this.usersService.findById(targetUserId);
        await this.semestersService.findById(dto.semesterId);
        if (dto.category ===
            shared_1.AchievementCategory.CENTRAL_COMPETITION ||
            dto.category ===
                shared_1.AchievementCategory.ACADEMY_COMPETITION) {
            if (!dto.competitionId) {
                throw new common_1.BadRequestException('Mục thành tích cuộc thi yêu cầu phải chọn cuộc thi liên kết');
            }
            const comp = await this.competitionsService.findById(dto.competitionId);
            if (comp.semesterId !== dto.semesterId) {
                throw new common_1.BadRequestException('Cuộc thi phải thuộc về học kỳ được chọn');
            }
        }
        if (dto.evidenceFileId) {
            const file = await this.prisma.uploadedFile.findUnique({
                where: { id: dto.evidenceFileId },
            });
            if (!file) {
                throw new common_1.BadRequestException('File minh chứng không tồn tại');
            }
        }
        const bonusPoint = bonus_point_map_1.BONUS_POINT_MAP[dto.category][dto.rank];
        let status = shared_1.AchievementStatus.PENDING;
        if (!isStudent) {
            status = dto.status || shared_1.AchievementStatus.APPROVED;
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
    async update(id, dto, reqUser) {
        const current = await this.achievementsRepository.findById(id);
        if (!current) {
            throw new common_1.NotFoundException('Thành tích không tồn tại');
        }
        const isStudent = reqUser.roles.includes('STUDENT');
        if (isStudent) {
            if (current.userId !== reqUser.id) {
                throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa thành tích này');
            }
            if (current.status !== shared_1.AchievementStatus.PENDING) {
                throw new common_1.BadRequestException('Không thể chỉnh sửa thành tích đã được xử lý (APPROVED/REJECTED)');
            }
        }
        const finalUserId = isStudent
            ? reqUser.id
            : dto.userId !== undefined
                ? dto.userId
                : current.userId;
        const finalSemesterId = dto.semesterId !== undefined ? dto.semesterId : current.semesterId;
        const finalCategory = dto.category !== undefined ? dto.category : current.category;
        const finalRank = dto.rank !== undefined ? dto.rank : current.rank;
        const finalCompetitionId = dto.competitionId !== undefined
            ? dto.competitionId
            : current.competitionId;
        const finalEvidenceFileId = dto.evidenceFileId !== undefined
            ? dto.evidenceFileId
            : current.evidenceFileId;
        if (finalUserId !== current.userId) {
            await this.usersService.findById(finalUserId);
        }
        if (finalSemesterId !== current.semesterId) {
            await this.semestersService.findById(finalSemesterId);
        }
        if (finalCategory ===
            shared_1.AchievementCategory.CENTRAL_COMPETITION ||
            finalCategory ===
                shared_1.AchievementCategory.ACADEMY_COMPETITION) {
            if (!finalCompetitionId) {
                throw new common_1.BadRequestException('Mục thành tích cuộc thi yêu cầu phải chọn cuộc thi liên kết');
            }
            const comp = await this.competitionsService.findById(finalCompetitionId);
            if (comp.semesterId !== finalSemesterId) {
                throw new common_1.BadRequestException('Cuộc thi phải thuộc về học kỳ được chọn');
            }
        }
        if (finalEvidenceFileId && finalEvidenceFileId !== current.evidenceFileId) {
            const file = await this.prisma.uploadedFile.findUnique({
                where: { id: finalEvidenceFileId },
            });
            if (!file) {
                throw new common_1.BadRequestException('File minh chứng không tồn tại');
            }
        }
        let bonusPoint = current.bonusPoint;
        if (dto.category !== undefined || dto.rank !== undefined) {
            bonusPoint = bonus_point_map_1.BONUS_POINT_MAP[finalCategory][finalRank];
        }
        let finalStatus = current.status;
        if (isStudent) {
            finalStatus = shared_1.AchievementStatus.PENDING;
        }
        else if (dto.status !== undefined) {
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
    async delete(id, reqUser) {
        const current = await this.achievementsRepository.findById(id);
        if (!current) {
            throw new common_1.NotFoundException('Thành tích không tồn tại');
        }
        const isStudent = reqUser.roles.includes('STUDENT');
        if (isStudent) {
            if (current.userId !== reqUser.id) {
                throw new common_1.ForbiddenException('Bạn không có quyền xoá thành tích này');
            }
            if (current.status !== shared_1.AchievementStatus.PENDING) {
                throw new common_1.BadRequestException('Không thể xoá thành tích đã được xử lý (APPROVED/REJECTED)');
            }
        }
        return this.achievementsRepository.delete(id);
    }
    async review(id, status) {
        const current = await this.achievementsRepository.findById(id);
        if (!current) {
            throw new common_1.NotFoundException('Thành tích không tồn tại');
        }
        return this.achievementsRepository.update(id, { status });
    }
};
exports.AchievementsService = AchievementsService;
exports.AchievementsService = AchievementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [achievements_repository_1.AchievementsRepository,
        semesters_service_1.SemestersService,
        competitions_service_1.CompetitionsService,
        users_service_1.UsersService,
        prisma_service_1.PrismaService])
], AchievementsService);
//# sourceMappingURL=achievements.service.js.map