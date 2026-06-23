import { PrismaService } from '../../prisma/prisma.service';
export declare class AuditLogRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        userId?: number;
        action: string;
        module: string;
        detail?: string;
    }): Promise<{
        id: number;
        userId: number | null;
        action: string;
        module: string;
        detail: string | null;
        timestamp: Date;
    }>;
    findAll(query: {
        page?: number;
        limit?: number;
        search?: string;
        action?: string;
        module?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        items: ({
            user: {
                id: number;
                studentCode: string;
                fullName: string;
            } | null;
        } & {
            id: number;
            userId: number | null;
            action: string;
            module: string;
            detail: string | null;
            timestamp: Date;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
