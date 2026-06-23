import { CompetitionsService } from '../services/competitions.service';
import { CreateCompetitionDto } from '../dto/create-competition.dto';
import { UpdateCompetitionDto } from '../dto/update-competition.dto';
import { QueryCompetitionDto } from '../dto/query-competition.dto';
export declare class CompetitionsController {
    private readonly competitionsService;
    constructor(competitionsService: CompetitionsService);
    findAll(query: QueryCompetitionDto): Promise<any>;
    findById(id: number): Promise<{
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
    create(dto: CreateCompetitionDto): Promise<{
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
    update(id: number, dto: UpdateCompetitionDto): Promise<{
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
