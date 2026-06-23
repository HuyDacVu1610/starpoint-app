import { Prisma, Grade } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryCandidateDto } from '../dto/query-candidate.dto';
export declare class ScholarshipsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryCandidateDto): Promise<{
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
            note: string | null;
            semesterId: number;
            extendedGpa: number;
            conductGrade: import("@prisma/client").$Enums.Grade;
            gpaGrade: import("@prisma/client").$Enums.Grade;
            isEligible: boolean;
            scholarshipTier: import("@prisma/client").$Enums.Grade | null;
        })[];
    }>;
    findById(id: number): Promise<({
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
        note: string | null;
        semesterId: number;
        extendedGpa: number;
        conductGrade: import("@prisma/client").$Enums.Grade;
        gpaGrade: import("@prisma/client").$Enums.Grade;
        isEligible: boolean;
        scholarshipTier: import("@prisma/client").$Enums.Grade | null;
    }) | null>;
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
    upsert(userId: number, semesterId: number, data: {
        extendedGpa: number;
        conductGrade: Grade;
        gpaGrade: Grade;
        isEligible: boolean;
        scholarshipTier: Grade | null;
        note?: string | null;
    }, tx?: Prisma.TransactionClient): Promise<{
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
    }>;
}
