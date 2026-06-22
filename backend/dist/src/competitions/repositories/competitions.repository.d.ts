import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryCompetitionDto } from '../dto/query-competition.dto';
export declare class CompetitionsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryCompetitionDto): Promise<{
        total: number;
        data: ({
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
            name: string;
            createdAt: Date;
            updatedAt: Date;
            semesterId: number;
            level: import("@prisma/client").$Enums.CompetitionLevel;
            organizer: string | null;
            eventDate: Date;
        })[];
    }>;
    findById(id: number): Promise<({
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        semesterId: number;
        level: import("@prisma/client").$Enums.CompetitionLevel;
        organizer: string | null;
        eventDate: Date;
    }) | null>;
    create(data: Prisma.CompetitionUncheckedCreateInput): Promise<{
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        semesterId: number;
        level: import("@prisma/client").$Enums.CompetitionLevel;
        organizer: string | null;
        eventDate: Date;
    }>;
    update(id: number, data: Prisma.CompetitionUncheckedUpdateInput): Promise<{
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        semesterId: number;
        level: import("@prisma/client").$Enums.CompetitionLevel;
        organizer: string | null;
        eventDate: Date;
    }>;
    delete(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        semesterId: number;
        level: import("@prisma/client").$Enums.CompetitionLevel;
        organizer: string | null;
        eventDate: Date;
    }>;
}
