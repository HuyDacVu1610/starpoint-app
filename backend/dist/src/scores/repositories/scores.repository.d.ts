import { Grade } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryScoreDto } from '../dto/query-score.dto';
export declare class ScoresRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
        semesterId: number;
        gpa: number;
        maxBonusPoint: number;
        extendedGpa: number;
        conductScore: number;
        conductGrade: import("@prisma/client").$Enums.Grade;
        gpaGrade: import("@prisma/client").$Enums.Grade;
    }) | null>;
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
    upsert(userId: number, semesterId: number, data: {
        gpa: number;
        maxBonusPoint: number;
        extendedGpa: number;
        conductScore: number;
        conductGrade: Grade;
        gpaGrade: Grade;
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
}
