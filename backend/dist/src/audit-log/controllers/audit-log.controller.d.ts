import { AuditLogService } from '../services/audit-log.service';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findAll(page?: number, limit?: number, search?: string, action?: string, module?: string, startDate?: string, endDate?: string): Promise<{
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
