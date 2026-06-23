import { SemestersService } from '../services/semesters.service';
import { ScoresService } from '../../scores/services/scores.service';
import { CreateSemesterDto } from '../dto/create-semester.dto';
import { UpdateSemesterDto } from '../dto/update-semester.dto';
import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';
export declare class SemestersController {
    private readonly semestersService;
    private readonly scoresService;
    constructor(semestersService: SemestersService, scoresService: ScoresService);
    findAll(query: PaginationQueryDto): Promise<{
        total: number;
        data: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            year: number;
            term: number;
            startDate: Date;
            endDate: Date;
        }[];
    }>;
    findById(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        term: number;
        startDate: Date;
        endDate: Date;
    }>;
    create(dto: CreateSemesterDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        term: number;
        startDate: Date;
        endDate: Date;
    }>;
    update(id: number, dto: UpdateSemesterDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        term: number;
        startDate: Date;
        endDate: Date;
    }>;
    delete(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        term: number;
        startDate: Date;
        endDate: Date;
    }>;
    updateStudentScore(semesterId: number, studentCode: string, dto: {
        gpa?: number;
        conductScore?: number;
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
