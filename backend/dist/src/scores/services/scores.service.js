"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoresService = void 0;
exports.getGpaGrade = getGpaGrade;
exports.getConductGrade = getConductGrade;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const client_1 = require("@prisma/client");
const xlsx = __importStar(require("xlsx"));
const prisma_service_1 = require("../../prisma/prisma.service");
const scores_repository_1 = require("../repositories/scores.repository");
const scholarships_service_1 = require("../../scholarships/services/scholarships.service");
const bonus_point_map_1 = require("../../achievements/constants/bonus-point-map");
function getGpaGrade(extendedGpa) {
    if (extendedGpa >= 3.6)
        return client_1.Grade.EXCELLENT;
    if (extendedGpa >= 3.2)
        return client_1.Grade.GOOD;
    if (extendedGpa >= 2.5)
        return client_1.Grade.FAIR;
    if (extendedGpa >= 2.0)
        return client_1.Grade.AVERAGE;
    if (extendedGpa >= 1.0)
        return client_1.Grade.WEAK;
    return client_1.Grade.POOR;
}
function getConductGrade(conductScore) {
    if (conductScore >= 90)
        return client_1.Grade.EXCELLENT;
    if (conductScore >= 80)
        return client_1.Grade.GOOD;
    if (conductScore >= 70)
        return client_1.Grade.FAIR;
    if (conductScore >= 50)
        return client_1.Grade.AVERAGE;
    if (conductScore >= 30)
        return client_1.Grade.WEAK;
    return client_1.Grade.POOR;
}
let ScoresService = class ScoresService {
    prisma;
    scoresRepository;
    scholarshipsService;
    rabbitClient;
    constructor(prisma, scoresRepository, scholarshipsService, rabbitClient) {
        this.prisma = prisma;
        this.scoresRepository = scoresRepository;
        this.scholarshipsService = scholarshipsService;
        this.rabbitClient = rabbitClient;
    }
    async findAll(query) {
        return this.scoresRepository.findAll(query);
    }
    async findById(id) {
        const score = await this.scoresRepository.findById(id);
        if (!score) {
            throw new common_1.NotFoundException('Không tìm thấy điểm học kỳ của sinh viên');
        }
        return score;
    }
    async findByUserAndSemester(userId, semesterId) {
        return this.scoresRepository.findByUserAndSemester(userId, semesterId);
    }
    async importScores(semesterId, fileBuffer) {
        const semester = await this.prisma.semester.findUnique({
            where: { id: semesterId },
        });
        if (!semester) {
            throw new common_1.NotFoundException(`Học kỳ id ${semesterId} không tồn tại`);
        }
        let workbook;
        try {
            workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        }
        catch {
            throw new common_1.BadRequestException('File Excel không hợp lệ hoặc bị lỗi định dạng');
        }
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            throw new common_1.BadRequestException('File Excel trống');
        }
        const worksheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(worksheet);
        if (rows.length === 0) {
            throw new common_1.BadRequestException('File Excel không có dữ liệu');
        }
        const firstRow = rows[0];
        const keys = Object.keys(firstRow);
        let studentCodeKey = '';
        let gpaKey = '';
        let conductScoreKey = '';
        let competitionNameKey = '';
        let achievementRankKey = '';
        for (const key of keys) {
            const normalized = key
                .toLowerCase()
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9]/g, '');
            if (normalized.includes('studentcode') ||
                normalized.includes('mssv') ||
                normalized.includes('masinhvien') ||
                normalized.includes('code') ||
                normalized === 'sv') {
                studentCodeKey = key;
            }
            else if (normalized.includes('gpa') ||
                normalized.includes('diemtrungbinh') ||
                normalized.includes('diemtb') ||
                normalized === 'tb' ||
                normalized.includes('tbcht')) {
                gpaKey = key;
            }
            else if (normalized.includes('conductscore') ||
                normalized.includes('diemrenluyen') ||
                normalized.includes('drl') ||
                normalized.includes('renluyen') ||
                normalized.includes('rl')) {
                conductScoreKey = key;
            }
            else if (normalized.includes('competition') ||
                normalized.includes('cuocthi') ||
                normalized.includes('tencuocthi')) {
                competitionNameKey = key;
            }
            else if (normalized.includes('rank') ||
                normalized.includes('award') ||
                normalized.includes('giaithuong') ||
                normalized.includes('giai')) {
                achievementRankKey = key;
            }
        }
        const missingHeaders = [];
        if (!studentCodeKey)
            missingHeaders.push('Mã sinh viên (MSSV)');
        if (!gpaKey)
            missingHeaders.push('Điểm GPA');
        if (!conductScoreKey)
            missingHeaders.push('Điểm rèn luyện');
        if (missingHeaders.length > 0) {
            throw new common_1.BadRequestException(`Không tìm thấy tiêu đề cột tương ứng trong file Excel: ${missingHeaders.join(', ')}`);
        }
        const validationErrors = [];
        const studentCodeCountMap = new Map();
        rows.forEach((row, index) => {
            const rowNum = index + 2;
            const rawCode = row[studentCodeKey];
            if (rawCode !== undefined && rawCode !== null) {
                const code = String(rawCode)
                    .trim()
                    .toUpperCase();
                if (code) {
                    if (!studentCodeCountMap.has(code)) {
                        studentCodeCountMap.set(code, []);
                    }
                    studentCodeCountMap.get(code).push(rowNum);
                }
            }
        });
        for (const [code, rowsList] of studentCodeCountMap.entries()) {
            if (rowsList.length > 1) {
                validationErrors.push(`Mã sinh viên "${code}" bị trùng lặp trong file Excel tại các dòng: ${rowsList.join(', ')}`);
            }
        }
        const validParsedRows = [];
        rows.forEach((row, index) => {
            const rowNum = index + 2;
            const rawCode = row[studentCodeKey];
            const rawGpa = row[gpaKey];
            const rawConduct = row[conductScoreKey];
            const rawComp = competitionNameKey ? row[competitionNameKey] : undefined;
            const rawRank = achievementRankKey ? row[achievementRankKey] : undefined;
            if (rawCode === undefined ||
                rawCode === null ||
                String(rawCode).trim() === '') {
                validationErrors.push(`Dòng ${rowNum}: Mã sinh viên không được để trống`);
                return;
            }
            const studentCode = String(rawCode)
                .trim()
                .toUpperCase();
            const gpa = Number(rawGpa);
            const conductScore = Number(rawConduct);
            const competitionName = rawComp ? String(rawComp).trim() : undefined;
            const achievementRank = rawRank ? String(rawRank).trim() : undefined;
            if (isNaN(gpa) || gpa < 0 || gpa > 4) {
                validationErrors.push(`Dòng ${rowNum}: Điểm GPA phải là số trong khoảng [0, 4]`);
                return;
            }
            if (isNaN(conductScore) ||
                conductScore < 0 ||
                conductScore > 100 ||
                !Number.isInteger(conductScore)) {
                validationErrors.push(`Dòng ${rowNum}: Điểm rèn luyện phải là số nguyên trong khoảng [0, 100]`);
                return;
            }
            validParsedRows.push({
                studentCode,
                gpa,
                conductScore,
                competitionName,
                achievementRank,
                rowNum,
            });
        });
        if (validationErrors.length > 0) {
            throw new common_1.BadRequestException(validationErrors);
        }
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
        validParsedRows.forEach((row) => {
            if (!dbUserMap.has(row.studentCode)) {
                validationErrors.push(`Dòng ${row.rowNum}: Sinh viên với mã "${row.studentCode}" không tồn tại trong hệ thống`);
            }
        });
        if (validationErrors.length > 0) {
            throw new common_1.BadRequestException(validationErrors);
        }
        await this.prisma.$transaction(async (tx) => {
            const compMap = new Map();
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
                const userId = dbUserMap.get(row.studentCode);
                if (row.competitionName && row.achievementRank) {
                    const normName = row.competitionName.toLowerCase().trim().replace(/\s+/g, ' ');
                    const comp = compMap.get(normName);
                    if (comp) {
                        const rankStr = row.achievementRank.toLowerCase();
                        let rank = client_1.AchievementRank.NONE;
                        if (rankStr.includes('nhất') ||
                            rankStr.includes('nhut') ||
                            rankStr.includes('hcv') ||
                            rankStr.includes('vàng') ||
                            rankStr.includes('first')) {
                            rank = client_1.AchievementRank.FIRST;
                        }
                        else if (rankStr.includes('nhì') ||
                            rankStr.includes('hcb') ||
                            rankStr.includes('bạc') ||
                            rankStr.includes('second')) {
                            rank = client_1.AchievementRank.SECOND;
                        }
                        else if (rankStr.includes('ba') ||
                            rankStr.includes('hcđ') ||
                            rankStr.includes('đồng') ||
                            rankStr.includes('third')) {
                            rank = client_1.AchievementRank.THIRD;
                        }
                        const category = comp.level === 'CENTRAL'
                            ? client_1.AchievementCategory.CENTRAL_COMPETITION
                            : client_1.AchievementCategory.ACADEMY_COMPETITION;
                        const bonusPoint = bonus_point_map_1.BONUS_POINT_MAP[category][rank];
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
                        }
                        else {
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
                const maxBonusPoint = achievements.length > 0
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
                await this.scholarshipsService.reevaluateCandidate(userId, semesterId, tx);
            }
        });
        this.rabbitClient.emit('bonus.calculated', { semesterId });
        return {
            success: true,
            message: `Đã import thành công bảng điểm cho ${validParsedRows.length} sinh viên`,
        };
    }
    async updateManualScore(semesterId, studentCode, dto) {
        const user = await this.prisma.user.findFirst({
            where: { studentCode: studentCode.toUpperCase() },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Sinh viên mã "${studentCode}" không tồn tại`);
        }
        const existingScore = await this.scoresRepository.findByUserAndSemester(user.id, semesterId);
        const newGpa = dto.gpa !== undefined ? dto.gpa : (existingScore ? existingScore.gpa : 0.0);
        const newConductScore = dto.conductScore !== undefined
            ? dto.conductScore
            : (existingScore ? existingScore.conductScore : 0.0);
        if (newGpa < 0 || newGpa > 4) {
            throw new common_1.BadRequestException('Điểm GPA phải nằm trong khoảng [0, 4]');
        }
        if (newConductScore < 0 || newConductScore > 100) {
            throw new common_1.BadRequestException('Điểm rèn luyện phải nằm trong khoảng [0, 100]');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            await tx.achievement.deleteMany({
                where: {
                    userId: user.id,
                    semesterId,
                    note: 'Được tạo tự động khi cập nhật điểm thủ công',
                },
            });
            if (dto.rank || dto.category) {
                let category;
                let competitionId = null;
                const rank = dto.rank || client_1.AchievementRank.NONE;
                if (dto.competitionId) {
                    const competition = await tx.competition.findUnique({
                        where: { id: dto.competitionId },
                    });
                    if (!competition) {
                        throw new common_1.NotFoundException(`Cuộc thi ID ${dto.competitionId} không tồn tại`);
                    }
                    if (competition.semesterId !== semesterId) {
                        throw new common_1.BadRequestException('Cuộc thi phải thuộc về học kỳ được chọn');
                    }
                    competitionId = dto.competitionId;
                    category =
                        competition.level === 'CENTRAL'
                            ? client_1.AchievementCategory.CENTRAL_COMPETITION
                            : client_1.AchievementCategory.ACADEMY_COMPETITION;
                }
                else {
                    if (rank !== client_1.AchievementRank.NONE) {
                        throw new common_1.BadRequestException('Các giải thưởng Nhất, Nhì, Ba yêu cầu phải chọn cuộc thi liên kết');
                    }
                    category = dto.category || client_1.AchievementCategory.ORGANIZATION_PARTICIPATION;
                }
                const bonusPoint = bonus_point_map_1.BONUS_POINT_MAP[category][rank];
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
            const maxBonusPoint = achievements.length > 0
                ? Math.max(...achievements.map((a) => a.bonusPoint))
                : 0.0;
            const extendedGpa = Number((newGpa + maxBonusPoint).toFixed(2));
            const gpaGrade = getGpaGrade(extendedGpa);
            const conductGrade = getConductGrade(newConductScore);
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
            await this.scholarshipsService.reevaluateCandidate(user.id, semesterId, tx);
            return updatedScore;
        });
        this.rabbitClient.emit('bonus.calculated', { semesterId });
        return result;
    }
    async recalculateScore(userId, semesterId, tx) {
        const prismaClient = tx || this.prisma;
        const score = await prismaClient.studentSemesterScore.findUnique({
            where: {
                userId_semesterId: { userId, semesterId },
            },
        });
        if (!score) {
            return;
        }
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
        const maxBonusPoint = achievements.length > 0
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
        await this.scholarshipsService.reevaluateCandidate(userId, semesterId, prismaClient);
        this.rabbitClient.emit('bonus.calculated', { semesterId });
    }
    async calculateScoresForSemester(semesterId) {
        const semester = await this.prisma.semester.findUnique({
            where: { id: semesterId },
        });
        if (!semester) {
            throw new common_1.NotFoundException(`Học kỳ id ${semesterId} không tồn tại`);
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
};
exports.ScoresService = ScoresService;
exports.ScoresService = ScoresService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => scholarships_service_1.ScholarshipsService))),
    __param(3, (0, common_1.Inject)('RABBITMQ_CLIENT')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        scores_repository_1.ScoresRepository,
        scholarships_service_1.ScholarshipsService,
        microservices_1.ClientProxy])
], ScoresService);
//# sourceMappingURL=scores.service.js.map