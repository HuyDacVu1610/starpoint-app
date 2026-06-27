import { ScholarshipsService } from '../services/scholarships.service';
import { QueryCandidateDto } from '../dto/query-candidate.dto';
import { EvaluateScholarshipDto } from '../dto/evaluate-scholarship.dto';
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
export declare class ScholarshipsController {
    private readonly scholarshipsService;
    constructor(scholarshipsService: ScholarshipsService);
    findAll(query: QueryCandidateDto): Promise<{
        total: number;
        data: ({
            user: {
                id: number;
                studentCode: string;
                email: string;
                fullName: string;
                avatarUrl: string | null;
                semesterScores: {
                    gpa: number;
                    conductScore: number;
                }[];
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
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            note: string | null;
            semesterId: number;
            extendedGpa: number;
            conductGrade: import("@prisma/client").$Enums.Grade;
            gpaGrade: import("@prisma/client").$Enums.Grade;
            isEligible: boolean;
            scholarshipTier: import("@prisma/client").$Enums.Grade | null;
        })[];
    }>;
    findMy(query: QueryCandidateDto, req: AuthenticatedRequest): Promise<{
        total: number;
        data: ({
            user: {
                id: number;
                studentCode: string;
                email: string;
                fullName: string;
                avatarUrl: string | null;
                semesterScores: {
                    gpa: number;
                    conductScore: number;
                }[];
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
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            note: string | null;
            semesterId: number;
            extendedGpa: number;
            conductGrade: import("@prisma/client").$Enums.Grade;
            gpaGrade: import("@prisma/client").$Enums.Grade;
            isEligible: boolean;
            scholarshipTier: import("@prisma/client").$Enums.Grade | null;
        })[];
    }>;
    evaluate(dto: EvaluateScholarshipDto): Promise<{
        evaluatedCount: number;
        eligibleCount: number;
        tierCounts: {
            EXCELLENT: number;
            GOOD: number;
            FAIR: number;
        };
    }>;
}
export {};
