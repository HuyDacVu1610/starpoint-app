import { Module } from '@nestjs/common';
import { SemestersService } from './services/semesters.service';
import { SemestersController } from './controllers/semesters.controller';
import { SemestersRepository } from './repositories/semesters.repository';
import { ScoresModule } from '../scores/scores.module';

@Module({
  imports: [ScoresModule],
  controllers: [SemestersController],
  providers: [SemestersService, SemestersRepository],
  exports: [SemestersService],
})
export class SemestersModule {}
