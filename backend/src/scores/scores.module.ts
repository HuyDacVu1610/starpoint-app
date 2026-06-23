import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ScoresRepository } from './repositories/scores.repository';
import { ScoresService } from './services/scores.service';
import { ScoresController } from './controllers/scores.controller';
import { ScoresMessageController } from './controllers/scores-message.controller';
import { ScholarshipsModule } from '../scholarships/scholarships.module';

@Module({
  imports: [PrismaModule, forwardRef(() => ScholarshipsModule)],
  controllers: [ScoresController, ScoresMessageController],
  providers: [ScoresService, ScoresRepository],
  exports: [ScoresService],
})
export class ScoresModule {}

