import { ClientProxy } from '@nestjs/microservices';
import { AchievementsRepository } from '../repositories/achievements.repository';
import { SemestersService } from '../../semesters/services/semesters.service';
import { CompetitionsService } from '../../competitions/services/competitions.service';
import { UsersService } from '../../users/services/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAchievementDto } from '../dto/create-achievement.dto';
import { UpdateAchievementDto } from '../dto/update-achievement.dto';
import { QueryAchievementDto } from '../dto/query-achievement.dto';
import { AchievementStatus } from '@starpointapp/shared';
import { ScoresService } from '../../scores/services/scores.service';
export declare class AchievementsService {
    private readonly achievementsRepository;
    private readonly semestersService;
    private readonly competitionsService;
    private readonly usersService;
    private readonly prisma;
    private readonly scoresService;
    private readonly rabbitClient;
    constructor(achievementsRepository: AchievementsRepository, semestersService: SemestersService, competitionsService: CompetitionsService, usersService: UsersService, prisma: PrismaService, scoresService: ScoresService, rabbitClient: ClientProxy);
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
    findById(id: number, reqUser: {
        id: number;
        roles: string[];
    }): Promise<{
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
    create(dto: CreateAchievementDto, reqUser: {
        id: number;
        roles: string[];
    }): Promise<{
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
    update(id: number, dto: UpdateAchievementDto, reqUser: {
        id: number;
        roles: string[];
    }): Promise<{
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
