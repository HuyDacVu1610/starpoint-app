import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';
export declare class SemestersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    } | null>;
    findByYearAndTerm(year: number, term: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        term: number;
        startDate: Date;
        endDate: Date;
    } | null>;
    create(data: Prisma.SemesterCreateInput): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        term: number;
        startDate: Date;
        endDate: Date;
    }>;
    update(id: number, data: Prisma.SemesterUpdateInput): Promise<{
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
}
