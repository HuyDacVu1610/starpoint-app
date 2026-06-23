import { ScoresService } from '../services/scores.service';
import { QueryScoreDto } from '../dto/query-score.dto';
import { Request } from 'express';
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
export declare class ScoresController {
    private readonly scoresService;
    constructor(scoresService: ScoresService);
    findAll(query: QueryScoreDto): Promise<{
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
        } & {
            id: number;
            userId: number;
            semesterId: number;
            gpa: number;
            maxBonusPoint: number;
            extendedGpa: number;
            conductScore: number;
            conductGrade: import("@prisma/client").$Enums.Grade;
            gpaGrade: import("@prisma/client").$Enums.Grade;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    findMy(query: QueryScoreDto, req: AuthenticatedRequest): Promise<{
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
        } & {
            id: number;
            userId: number;
            semesterId: number;
            gpa: number;
            maxBonusPoint: number;
            extendedGpa: number;
            conductScore: number;
            conductGrade: import("@prisma/client").$Enums.Grade;
            gpaGrade: import("@prisma/client").$Enums.Grade;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    importScores(semesterId: number, file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
    }>;
    calculateScores(semesterId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
