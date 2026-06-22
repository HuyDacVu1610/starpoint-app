import { Module } from '@nestjs/common';
import { CompetitionsService } from './services/competitions.service';
import { CompetitionsController } from './controllers/competitions.controller';
import { CompetitionsRepository } from './repositories/competitions.repository';
import { SemestersModule } from '../semesters/semesters.module';

@Module({
  imports: [SemestersModule],
  controllers: [CompetitionsController],
  providers: [CompetitionsService, CompetitionsRepository],
  exports: [CompetitionsService],
})
export class CompetitionsModule {}
