import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardMessageController } from './controllers/dashboard-message.controller';
import { DashboardService } from './services/dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController, DashboardMessageController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

