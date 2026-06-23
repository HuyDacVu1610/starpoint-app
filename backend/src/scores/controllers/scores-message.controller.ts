import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ScoresService } from '../services/scores.service';

@Controller()
export class ScoresMessageController {
  constructor(private readonly scoresService: ScoresService) {}

  @EventPattern('achievement.created')
  async handleAchievementCreated(@Payload() data: { userId: number; semesterId: number }) {
    console.log('Received achievement.created event via RabbitMQ:', data);
    await this.scoresService.recalculateScore(data.userId, data.semesterId);
  }
}
