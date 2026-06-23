import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from '../services/audit-log.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../shared/common/decorators/permissions.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @RequirePermissions('VIEW_USER') // We can restrict to ADMIN role or matching user viewing permissions
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('module') module?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditLogService.findAll({
      page,
      limit,
      search,
      action,
      module,
      startDate,
      endDate,
    });
  }
}
