import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DashboardService } from '../services/dashboard.service';

@Controller()
export class DashboardMessageController {
  constructor(private readonly dashboardService: DashboardService) {}

  @EventPattern('bonus.calculated')
  async handleBonusCalculated(@Payload() data: { semesterId: number }) {
    console.log('Received bonus.calculated event via RabbitMQ for semester:', data.semesterId);
    await this.dashboardService.clearCache(data.semesterId);
  }
}
