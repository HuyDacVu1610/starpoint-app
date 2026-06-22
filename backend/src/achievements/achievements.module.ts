import { Module } from '@nestjs/common';
import { AchievementsService } from './services/achievements.service';
import { AchievementsController } from './controllers/achievements.controller';
import { AchievementsRepository } from './repositories/achievements.repository';
import { SemestersModule } from '../semesters/semesters.module';
import { CompetitionsModule } from '../competitions/competitions.module';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, SemestersModule, CompetitionsModule, UsersModule],
  controllers: [AchievementsController],
  providers: [AchievementsService, AchievementsRepository],
  exports: [AchievementsService],
})
export class AchievementsModule {}
