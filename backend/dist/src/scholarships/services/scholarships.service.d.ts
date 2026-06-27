import { ClientProxy } from '@nestjs/microservices';
import { Prisma, Grade } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ScholarshipsRepository } from '../repositories/scholarships.repository';
import { QueryCandidateDto } from '../dto/query-candidate.dto';
export declare function calculateScholarship(gpaGrade: Grade, conductGrade: Grade): {
    isEligible: boolean;
    scholarshipTier: Grade | null;
    note: string;
};
export declare class ScholarshipsService {
    private readonly prisma;
    private readonly scholarshipsRepository;
    private readonly rabbitClient;
    constructor(prisma: PrismaService, scholarshipsRepository: ScholarshipsRepository, rabbitClient: ClientProxy);
    findAll(query: QueryCandidateDto): Promise<{
        total: number;
        data: ({
            user: {
                id: number;
                studentCode: string;
                email: string;
                fullName: string;
                avatarUrl: string | null;
                semesterScores: {
                    gpa: number;
                    conductScore: number;
                }[];
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
            note: string | null;
            semesterId: number;
            extendedGpa: number;
            conductGrade: import("@prisma/client").$Enums.Grade;
            gpaGrade: import("@prisma/client").$Enums.Grade;
            isEligible: boolean;
            scholarshipTier: import("@prisma/client").$Enums.Grade | null;
        })[];
    }>;
    findByUserAndSemester(userId: number, semesterId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        note: string | null;
        semesterId: number;
        extendedGpa: number;
        conductGrade: import("@prisma/client").$Enums.Grade;
        gpaGrade: import("@prisma/client").$Enums.Grade;
        isEligible: boolean;
        scholarshipTier: import("@prisma/client").$Enums.Grade | null;
    } | null>;
    evaluateScholarships(semesterId: number): Promise<{
        evaluatedCount: number;
        eligibleCount: number;
        tierCounts: {
            EXCELLENT: number;
            GOOD: number;
            FAIR: number;
        };
    }>;
    reevaluateCandidate(userId: number, semesterId: number, tx?: Prisma.TransactionClient): Promise<void>;
}
