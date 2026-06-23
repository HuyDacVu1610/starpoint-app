import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuditLogService } from '../services/audit-log.service';

@Controller()
export class AuditLogMessageController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @EventPattern('scholarship.evaluated')
  async handleScholarshipEvaluated(
    @Payload() data: { semesterId: number; evaluatedCount: number; eligibleCount: number; tierCounts: any },
  ) {
    console.log('Received scholarship.evaluated event via RabbitMQ:', data);
    const detail = `Đã xét duyệt học bổng cho học kỳ ID: ${data.semesterId}. Tổng số sinh viên được xét: ${data.evaluatedCount}, Số sinh viên đạt chuẩn: ${data.eligibleCount}. Chi tiết: Xuất sắc: ${data.tierCounts.EXCELLENT || 0}, Giỏi: ${data.tierCounts.GOOD || 0}, Khá: ${data.tierCounts.FAIR || 0}`;
    
    await this.auditLogService.log({
      action: 'EVALUATE',
      module: 'SCHOLARSHIP',
      detail,
    });
  }
}
