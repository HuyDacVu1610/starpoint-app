import { ClientProxy } from '@nestjs/microservices';
import { Prisma, Grade, AchievementRank, AchievementCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoresRepository } from '../repositories/scores.repository';
import { QueryScoreDto } from '../dto/query-score.dto';
import { ScholarshipsService } from '../../scholarships/services/scholarships.service';
export declare function getGpaGrade(extendedGpa: number): Grade;
export declare function getConductGrade(conductScore: number): Grade;
export declare class ScoresService {
    private readonly prisma;
    private readonly scoresRepository;
    private readonly scholarshipsService;
    private readonly rabbitClient;
    constructor(prisma: PrismaService, scoresRepository: ScoresRepository, scholarshipsService: ScholarshipsService, rabbitClient: ClientProxy);
    findAll(query: QueryScoreDto): Promise<{
        total: number;
        data: ({
            user: {
                id: number;
                studentCode: string;
                email: string;
                fullName: string;
                avatarUrl: string | null;
            };
            semester: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                year: number;
                term: number;
                startDate: Date;
                endDate: Date;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            semesterId: number;
            gpa: number;
            maxBonusPoint: number;
            extendedGpa: number;
            conductScore: number;
            conductGrade: import("@prisma/client").$Enums.Grade;
            gpaGrade: import("@prisma/client").$Enums.Grade;
        })[];
    }>;
    findById(id: number): Promise<{
        user: {
            id: number;
            studentCode: string;
            email: string;
            fullName: string;
        };
        semester: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            year: number;
            term: number;
            startDate: Date;
            endDate: Date;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        semesterId: number;
        gpa: number;
        maxBonusPoint: number;
        extendedGpa: number;
        conductScore: number;
        conductGrade: import("@prisma/client").$Enums.Grade;
        gpaGrade: import("@prisma/client").$Enums.Grade;
    }>;
    findByUserAndSemester(userId: number, semesterId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        semesterId: number;
        gpa: number;
        maxBonusPoint: number;
        extendedGpa: number;
        conductScore: number;
        conductGrade: import("@prisma/client").$Enums.Grade;
        gpaGrade: import("@prisma/client").$Enums.Grade;
    } | null>;
    importScores(semesterId: number, fileBuffer: Buffer): Promise<{
        success: boolean;
        message: string;
    }>;
    updateManualScore(semesterId: number, studentCode: string, dto: {
        gpa?: number;
        conductScore?: number;
        competitionId?: number;
        rank?: AchievementRank;
        category?: AchievementCategory;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        semesterId: number;
        gpa: number;
        maxBonusPoint: number;
        extendedGpa: number;
        conductScore: number;
        conductGrade: import("@prisma/client").$Enums.Grade;
        gpaGrade: import("@prisma/client").$Enums.Grade;
    }>;
    recalculateScore(userId: number, semesterId: number, tx?: Prisma.TransactionClient): Promise<void>;
    calculateScoresForSemester(semesterId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
