import { Request } from 'express';
import { AchievementsService } from '../services/achievements.service';
import { CreateAchievementDto } from '../dto/create-achievement.dto';
import { UpdateAchievementDto } from '../dto/update-achievement.dto';
import { QueryAchievementDto } from '../dto/query-achievement.dto';
import { AchievementStatus } from '@starpointapp/shared';
interface UserPayload {
    id: number;
    studentCode: string;
    email: string;
    roles: string[];
    permissions: string[];
}
interface AuthenticatedRequest extends Request {
    user: UserPayload;
}
export declare class AchievementsController {
    private readonly achievementsService;
    constructor(achievementsService: AchievementsService);
    findAll(query: QueryAchievementDto): Promise<{
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
            competition: {
                id: number;
                semesterId: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
            userId: number;
            semesterId: number;
            createdAt: Date;
            updatedAt: Date;
            competitionId: number | null;
            category: import("@prisma/client").$Enums.AchievementCategory;
            rank: import("@prisma/client").$Enums.AchievementRank;
            bonusPoint: number;
            evidence: string | null;
            evidenceFileId: number | null;
            status: import("@prisma/client").$Enums.AchievementStatus;
            note: string | null;
        })[];
    }>;
    findMy(query: QueryAchievementDto, req: AuthenticatedRequest): Promise<{
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
            competition: {
                id: number;
                semesterId: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
            userId: number;
            semesterId: number;
            createdAt: Date;
            updatedAt: Date;
            competitionId: number | null;
            category: import("@prisma/client").$Enums.AchievementCategory;
            rank: import("@prisma/client").$Enums.AchievementRank;
            bonusPoint: number;
            evidence: string | null;
            evidenceFileId: number | null;
            status: import("@prisma/client").$Enums.AchievementStatus;
            note: string | null;
        })[];
    }>;
    findById(id: number, req: AuthenticatedRequest): Promise<{
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
        competition: {
            id: number;
            semesterId: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
        userId: number;
        semesterId: number;
        createdAt: Date;
        updatedAt: Date;
        competitionId: number | null;
        category: import("@prisma/client").$Enums.AchievementCategory;
        rank: import("@prisma/client").$Enums.AchievementRank;
        bonusPoint: number;
        evidence: string | null;
        evidenceFileId: number | null;
        status: import("@prisma/client").$Enums.AchievementStatus;
        note: string | null;
    }>;
    create(dto: CreateAchievementDto, req: AuthenticatedRequest): Promise<{
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
        competition: {
            id: number;
            semesterId: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
        userId: number;
        semesterId: number;
        createdAt: Date;
        updatedAt: Date;
        competitionId: number | null;
        category: import("@prisma/client").$Enums.AchievementCategory;
        rank: import("@prisma/client").$Enums.AchievementRank;
        bonusPoint: number;
        evidence: string | null;
        evidenceFileId: number | null;
        status: import("@prisma/client").$Enums.AchievementStatus;
        note: string | null;
    }>;
    update(id: number, dto: UpdateAchievementDto, req: AuthenticatedRequest): Promise<{
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
        competition: {
            id: number;
            semesterId: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
        userId: number;
        semesterId: number;
        createdAt: Date;
        updatedAt: Date;
        competitionId: number | null;
        category: import("@prisma/client").$Enums.AchievementCategory;
        rank: import("@prisma/client").$Enums.AchievementRank;
        bonusPoint: number;
        evidence: string | null;
        evidenceFileId: number | null;
        status: import("@prisma/client").$Enums.AchievementStatus;
        note: string | null;
    }>;
    delete(id: number, req: AuthenticatedRequest): Promise<{
        id: number;
        userId: number;
        semesterId: number;
        createdAt: Date;
        updatedAt: Date;
        competitionId: number | null;
        category: import("@prisma/client").$Enums.AchievementCategory;
        rank: import("@prisma/client").$Enums.AchievementRank;
        bonusPoint: number;
        evidence: string | null;
        evidenceFileId: number | null;
        status: import("@prisma/client").$Enums.AchievementStatus;
        note: string | null;
    }>;
    review(id: number, status: AchievementStatus): Promise<{
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
        competition: {
            id: number;
            semesterId: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
        userId: number;
        semesterId: number;
        createdAt: Date;
        updatedAt: Date;
        competitionId: number | null;
        category: import("@prisma/client").$Enums.AchievementCategory;
        rank: import("@prisma/client").$Enums.AchievementRank;
        bonusPoint: number;
        evidence: string | null;
        evidenceFileId: number | null;
        status: import("@prisma/client").$Enums.AchievementStatus;
        note: string | null;
    }>;
}
export {};
