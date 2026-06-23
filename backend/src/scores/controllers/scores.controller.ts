import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Body,
  ParseIntPipe,
  BadRequestException,
  Request as NestRequest,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScoresService } from '../services/scores.service';
import { QueryScoreDto } from '../dto/query-score.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../shared/common/decorators/permissions.decorator';
import { Request } from 'express';
import { LogAction } from '../../shared/common/decorators/log-action.decorator';

interface UserPayload {
  id: number;
  studentCode: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

@Controller('scores')
@UseGuards(JwtAuthGuard)
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('VIEW_BONUS')
  async findAll(@Query() query: QueryScoreDto) {
    return this.scoresService.findAll(query);
  }

  @Get('my')
  async findMy(
    @Query() query: QueryScoreDto,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    query.userId = req.user.id;
    return this.scoresService.findAll(query);
  }

  @Post('import')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('MANAGE_BONUS')
  @UseInterceptors(FileInterceptor('file'))
  @LogAction('IMPORT', 'SCORE')
  async importScores(
    @Body('semesterId', ParseIntPipe) semesterId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng tải lên file Excel');
    }
    return this.scoresService.importScores(semesterId, file.buffer);
  }

  @Post('calculate/:semesterId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('MANAGE_BONUS')
  @LogAction('CALCULATE', 'SCORE')
  async calculateScores(@Param('semesterId', ParseIntPipe) semesterId: number) {
    return this.scoresService.calculateScoresForSemester(semesterId);
  }
}

