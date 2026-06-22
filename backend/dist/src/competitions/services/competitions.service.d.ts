import { CompetitionsRepository } from '../repositories/competitions.repository';
import { SemestersService } from '../../semesters/services/semesters.service';
import { CreateCompetitionDto } from '../dto/create-competition.dto';
import { UpdateCompetitionDto } from '../dto/update-competition.dto';
import { QueryCompetitionDto } from '../dto/query-competition.dto';
export declare class CompetitionsService {
    private readonly competitionsRepository;
    private readonly semestersService;
    constructor(competitionsRepository: CompetitionsRepository, semestersService: SemestersService);
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
