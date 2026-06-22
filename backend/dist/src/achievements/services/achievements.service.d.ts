import { AchievementsRepository } from '../repositories/achievements.repository';
import { SemestersService } from '../../semesters/services/semesters.service';
import { CompetitionsService } from '../../competitions/services/competitions.service';
import { UsersService } from '../../users/services/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAchievementDto } from '../dto/create-achievement.dto';
import { UpdateAchievementDto } from '../dto/update-achievement.dto';
import { QueryAchievementDto } from '../dto/query-achievement.dto';
import { AchievementStatus } from '@starpointapp/shared';
export declare class AchievementsService {
    private readonly achievementsRepository;
    private readonly semestersService;
    private readonly competitionsService;
    private readonly usersService;
    private readonly prisma;
    constructor(achievementsRepository: AchievementsRepository, semestersService: SemestersService, competitionsService: CompetitionsService, usersService: UsersService, prisma: PrismaService);
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
    findById(id: number, reqUser: {
        id: number;
        roles: string[];
    }): Promise<{
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
    create(dto: CreateAchievementDto, reqUser: {
        id: number;
        roles: string[];
    }): Promise<{
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
    update(id: number, dto: UpdateAchievementDto, reqUser: {
        id: number;
        roles: string[];
    }): Promise<{
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
    delete(id: number, reqUser: {
        id: number;
        roles: string[];
    }): Promise<{
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
}
