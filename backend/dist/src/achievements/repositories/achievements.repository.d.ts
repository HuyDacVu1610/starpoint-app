import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryAchievementDto } from '../dto/query-achievement.dto';
export declare class AchievementsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryAchievementDto): Promise<{
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
            competition: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                semesterId: number;
                level: import("@prisma/client").$Enums.CompetitionLevel;
                organizer: string | null;
                eventDate: Date;
            } | null;
            evidenceFile: {
                id: number;
                createdAt: Date;
                originalName: string;
                storedPath: string;
                mimeType: string;
                sizeBytes: number;
                uploadedById: number;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            category: import("@prisma/client").$Enums.AchievementCategory;
            rank: import("@prisma/client").$Enums.AchievementRank;
            bonusPoint: number;
            evidence: string | null;
            status: import("@prisma/client").$Enums.AchievementStatus;
            note: string | null;
            competitionId: number | null;
            semesterId: number;
            evidenceFileId: number | null;
        })[];
    }>;
    findById(id: number): Promise<({
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
        competition: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            semesterId: number;
            level: import("@prisma/client").$Enums.CompetitionLevel;
            organizer: string | null;
            eventDate: Date;
        } | null;
        evidenceFile: {
            id: number;
            createdAt: Date;
            originalName: string;
            storedPath: string;
            mimeType: string;
            sizeBytes: number;
            uploadedById: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        category: import("@prisma/client").$Enums.AchievementCategory;
        rank: import("@prisma/client").$Enums.AchievementRank;
        bonusPoint: number;
        evidence: string | null;
        status: import("@prisma/client").$Enums.AchievementStatus;
        note: string | null;
        competitionId: number | null;
        semesterId: number;
        evidenceFileId: number | null;
    }) | null>;
    create(data: Prisma.AchievementUncheckedCreateInput): Promise<{
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
        competition: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            semesterId: number;
            level: import("@prisma/client").$Enums.CompetitionLevel;
            organizer: string | null;
            eventDate: Date;
        } | null;
        evidenceFile: {
            id: number;
            createdAt: Date;
            originalName: string;
            storedPath: string;
            mimeType: string;
            sizeBytes: number;
            uploadedById: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        category: import("@prisma/client").$Enums.AchievementCategory;
        rank: import("@prisma/client").$Enums.AchievementRank;
        bonusPoint: number;
        evidence: string | null;
        status: import("@prisma/client").$Enums.AchievementStatus;
        note: string | null;
        competitionId: number | null;
        semesterId: number;
        evidenceFileId: number | null;
    }>;
    update(id: number, data: Prisma.AchievementUncheckedUpdateInput): Promise<{
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
        competition: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            semesterId: number;
            level: import("@prisma/client").$Enums.CompetitionLevel;
            organizer: string | null;
            eventDate: Date;
        } | null;
        evidenceFile: {
            id: number;
            createdAt: Date;
            originalName: string;
            storedPath: string;
            mimeType: string;
            sizeBytes: number;
            uploadedById: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        category: import("@prisma/client").$Enums.AchievementCategory;
        rank: import("@prisma/client").$Enums.AchievementRank;
        bonusPoint: number;
        evidence: string | null;
        status: import("@prisma/client").$Enums.AchievementStatus;
        note: string | null;
        competitionId: number | null;
        semesterId: number;
        evidenceFileId: number | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        category: import("@prisma/client").$Enums.AchievementCategory;
        rank: import("@prisma/client").$Enums.AchievementRank;
        bonusPoint: number;
        evidence: string | null;
        status: import("@prisma/client").$Enums.AchievementStatus;
        note: string | null;
        competitionId: number | null;
        semesterId: number;
        evidenceFileId: number | null;
    }>;
}
