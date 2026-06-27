import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SemestersService } from '../services/semesters.service';
import { ScoresService } from '../../scores/services/scores.service';
import { CreateSemesterDto } from '../dto/create-semester.dto';
import { UpdateSemesterDto } from '../dto/update-semester.dto';
import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../shared/common/decorators/permissions.decorator';
import { LogAction } from '../../shared/common/decorators/log-action.decorator';
import { AchievementRank, AchievementCategory } from '@prisma/client';

@Controller('semesters')
@UseGuards(JwtAuthGuard)
export class SemestersController {
  constructor(
    private readonly semestersService: SemestersService,
    private readonly scoresService: ScoresService,
  ) {}

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.semestersService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.semestersService.findById(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('MANAGE_SEMESTER')
  @LogAction('CREATE', 'SEMESTER')
  async create(@Body() dto: CreateSemesterDto) {
    return this.semestersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('MANAGE_SEMESTER')
  @LogAction('UPDATE', 'SEMESTER')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSemesterDto,
  ) {
    return this.semestersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('MANAGE_SEMESTER')
  @LogAction('DELETE', 'SEMESTER')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.semestersService.delete(id);
  }

  @Patch(':semesterId/students/:studentCode')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('MANAGE_BONUS')
  @LogAction('UPDATE', 'SCORE')
  async updateStudentScore(
    @Param('semesterId', ParseIntPipe) semesterId: number,
    @Param('studentCode') studentCode: string,
    @Body() dto: { gpa?: number; conductScore?: number; competitionId?: number; rank?: AchievementRank; category?: AchievementCategory },
  ) {
    return this.scoresService.updateManualScore(semesterId, studentCode, dto);
  }
}

