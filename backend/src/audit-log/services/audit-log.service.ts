import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '../repositories/audit-log.repository';

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async log(data: { userId?: number; action: string; module: string; detail?: string }) {
    try {
      return await this.auditLogRepository.create(data);
    } catch (err) {
      console.error('Failed to create audit log:', err);
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
    module?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.auditLogRepository.findAll(query);
  }
}
