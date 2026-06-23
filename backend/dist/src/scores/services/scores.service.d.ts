import { Prisma, Grade } from '@prisma/client';
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
    constructor(prisma: PrismaService, scoresRepository: ScoresRepository, scholarshipsService: ScholarshipsService);
    findAll(query: QueryScoreDto): Promise<{
        total: number;
        data: ({
            user: {
                id: number;
                studentCode: string;
                fullName: string;
                email: string;
                avatarUrl: string | null;
            };
            semester: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                year: number;
                term: number;
                startDate: Date;
                endDate: Date;
            };
        } & {
            id: number;
            userId: number;
            semesterId: number;
            gpa: number;
            maxBonusPoint: number;
            extendedGpa: number;
            conductScore: number;
            conductGrade: import("@prisma/client").$Enums.Grade;
            gpaGrade: import("@prisma/client").$Enums.Grade;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    findById(id: number): Promise<{
        user: {
            id: number;
            studentCode: string;
            fullName: string;
            email: string;
        };
        semester: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            year: number;
            term: number;
            startDate: Date;
            endDate: Date;
        };
    } & {
        id: number;
        userId: number;
        semesterId: number;
        gpa: number;
        maxBonusPoint: number;
        extendedGpa: number;
        conductScore: number;
        conductGrade: import("@prisma/client").$Enums.Grade;
        gpaGrade: import("@prisma/client").$Enums.Grade;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByUserAndSemester(userId: number, semesterId: number): Promise<{
        id: number;
        userId: number;
        semesterId: number;
        gpa: number;
        maxBonusPoint: number;
        extendedGpa: number;
        conductScore: number;
        conductGrade: import("@prisma/client").$Enums.Grade;
        gpaGrade: import("@prisma/client").$Enums.Grade;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    importScores(semesterId: number, fileBuffer: Buffer): Promise<{
        success: boolean;
        message: string;
    }>;
    updateManualScore(semesterId: number, studentCode: string, dto: {
        gpa?: number;
        conductScore?: number;
    }): Promise<{
        id: number;
        userId: number;
        semesterId: number;
        gpa: number;
        maxBonusPoint: number;
        extendedGpa: number;
        conductScore: number;
        conductGrade: import("@prisma/client").$Enums.Grade;
        gpaGrade: import("@prisma/client").$Enums.Grade;
        createdAt: Date;
        updatedAt: Date;
    }>;
    recalculateScore(userId: number, semesterId: number, tx?: Prisma.TransactionClient): Promise<void>;
    calculateScoresForSemester(semesterId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
