import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ScholarshipsRepository } from './repositories/scholarships.repository';
import { ScholarshipsService } from './services/scholarships.service';
import { ScholarshipsController } from './controllers/scholarships.controller';
import { ScoresModule } from '../scores/scores.module';

@Module({
  imports: [PrismaModule, forwardRef(() => ScoresModule)],
  controllers: [ScholarshipsController],
  providers: [ScholarshipsService, ScholarshipsRepository],
  exports: [ScholarshipsService],
})
export class ScholarshipsModule {}
