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
            competition: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                semesterId: number;
                level: import("@prisma/client").$Enums.CompetitionLevel;
                organizer: string | null;
                eventDate: Date;
            } | null;
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
            competition: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                semesterId: number;
                level: import("@prisma/client").$Enums.CompetitionLevel;
                organizer: string | null;
                eventDate: Date;
            } | null;
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
    findById(id: number, req: AuthenticatedRequest): Promise<{
        user: {
            id: number;
            studentCode: string;
            fullName: string;
            email: string;
            avatarUrl: string | null;
        };
        competition: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            semesterId: number;
            level: import("@prisma/client").$Enums.CompetitionLevel;
            organizer: string | null;
            eventDate: Date;
        } | null;
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
    create(dto: CreateAchievementDto, req: AuthenticatedRequest): Promise<{
        user: {
            id: number;
            studentCode: string;
            fullName: string;
            email: string;
            avatarUrl: string | null;
        };
        competition: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            semesterId: number;
            level: import("@prisma/client").$Enums.CompetitionLevel;
            organizer: string | null;
            eventDate: Date;
        } | null;
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
    update(id: number, dto: UpdateAchievementDto, req: AuthenticatedRequest): Promise<{
        user: {
            id: number;
            studentCode: string;
            fullName: string;
            email: string;
            avatarUrl: string | null;
        };
        competition: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            semesterId: number;
            level: import("@prisma/client").$Enums.CompetitionLevel;
            organizer: string | null;
            eventDate: Date;
        } | null;
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
    delete(id: number, req: AuthenticatedRequest): Promise<{
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
    review(id: number, status: AchievementStatus): Promise<{
        user: {
            id: number;
            studentCode: string;
            fullName: string;
            email: string;
            avatarUrl: string | null;
        };
        competition: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            semesterId: number;
            level: import("@prisma/client").$Enums.CompetitionLevel;
            organizer: string | null;
            eventDate: Date;
        } | null;
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
}
export {};
