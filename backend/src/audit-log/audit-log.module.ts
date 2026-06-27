import { Module } from '@nestjs/common';
import { AuditLogService } from './services/audit-log.service';
import { AuditLogController } from './controllers/audit-log.controller';
import { AuditLogMessageController } from './controllers/audit-log-message.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuditLogController, AuditLogMessageController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
