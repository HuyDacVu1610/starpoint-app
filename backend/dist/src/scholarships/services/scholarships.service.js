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
exports.ScholarshipsService = void 0;
exports.calculateScholarship = calculateScholarship;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const scholarships_repository_1 = require("../repositories/scholarships.repository");
function calculateScholarship(gpaGrade, conductGrade) {
    const isGpaEligible = gpaGrade === client_1.Grade.EXCELLENT ||
        gpaGrade === client_1.Grade.GOOD ||
        gpaGrade === client_1.Grade.FAIR;
    const isConductEligible = conductGrade === client_1.Grade.EXCELLENT ||
        conductGrade === client_1.Grade.GOOD ||
        conductGrade === client_1.Grade.FAIR;
    if (!isGpaEligible || !isConductEligible) {
        return {
            isEligible: false,
            scholarshipTier: null,
            note: 'Không đủ điều kiện (GPA mở rộng hoặc Điểm rèn luyện dưới loại Khá)',
        };
    }
    if (gpaGrade === client_1.Grade.EXCELLENT && conductGrade === client_1.Grade.EXCELLENT) {
        return {
            isEligible: true,
            scholarshipTier: client_1.Grade.EXCELLENT,
            note: 'Đủ điều kiện nhận học bổng loại Xuất sắc',
        };
    }
    const isGpaGoodOrHigher = gpaGrade === client_1.Grade.EXCELLENT || gpaGrade === client_1.Grade.GOOD;
    const isConductGoodOrHigher = conductGrade === client_1.Grade.EXCELLENT || conductGrade === client_1.Grade.GOOD;
    if (isGpaGoodOrHigher && isConductGoodOrHigher) {
        return {
            isEligible: true,
            scholarshipTier: client_1.Grade.GOOD,
            note: 'Đủ điều kiện nhận học bổng loại Giỏi',
        };
    }
    return {
        isEligible: true,
        scholarshipTier: client_1.Grade.FAIR,
        note: 'Đủ điều kiện nhận học bổng loại Khá',
    };
}
let ScholarshipsService = class ScholarshipsService {
    prisma;
    scholarshipsRepository;
    constructor(prisma, scholarshipsRepository) {
        this.prisma = prisma;
        this.scholarshipsRepository = scholarshipsRepository;
    }
    async findAll(query) {
        return this.scholarshipsRepository.findAll(query);
    }
    async findByUserAndSemester(userId, semesterId) {
        return this.scholarshipsRepository.findByUserAndSemester(userId, semesterId);
    }
    async evaluateScholarships(semesterId) {
        const semester = await this.prisma.semester.findUnique({
            where: { id: semesterId },
        });
        if (!semester) {
            throw new common_1.NotFoundException(`Học kỳ id ${semesterId} không tồn tại`);
        }
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
                const evalResult = calculateScholarship(score.gpaGrade, score.conductGrade);
                await this.scholarshipsRepository.upsert(score.userId, semesterId, {
                    extendedGpa: score.extendedGpa,
                    conductGrade: score.conductGrade,
                    gpaGrade: score.gpaGrade,
                    isEligible: evalResult.isEligible,
                    scholarshipTier: evalResult.scholarshipTier,
                    note: evalResult.note,
                }, tx);
                evaluatedCount++;
                if (evalResult.isEligible) {
                    eligibleCount++;
                    if (evalResult.scholarshipTier) {
                        tierCounts[evalResult.scholarshipTier]++;
                    }
                }
            }
        });
        return {
            evaluatedCount,
            eligibleCount,
            tierCounts,
        };
    }
    async reevaluateCandidate(userId, semesterId, tx) {
        const prismaClient = tx || this.prisma;
        const score = await prismaClient.studentSemesterScore.findUnique({
            where: {
                userId_semesterId: { userId, semesterId },
            },
        });
        if (!score) {
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
        await this.scholarshipsRepository.upsert(userId, semesterId, {
            extendedGpa: score.extendedGpa,
            conductGrade: score.conductGrade,
            gpaGrade: score.gpaGrade,
            isEligible: evalResult.isEligible,
            scholarshipTier: evalResult.scholarshipTier,
            note: evalResult.note,
        }, prismaClient);
    }
};
exports.ScholarshipsService = ScholarshipsService;
exports.ScholarshipsService = ScholarshipsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        scholarships_repository_1.ScholarshipsRepository])
], ScholarshipsService);
//# sourceMappingURL=scholarships.service.js.map