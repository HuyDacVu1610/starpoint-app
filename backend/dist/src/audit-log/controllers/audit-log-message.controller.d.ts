import { AuditLogService } from '../services/audit-log.service';
export declare class AuditLogMessageController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    handleScholarshipEvaluated(data: {
        semesterId: number;
        evaluatedCount: number;
        eligibleCount: number;
        tierCounts: any;
    }): Promise<void>;
}
