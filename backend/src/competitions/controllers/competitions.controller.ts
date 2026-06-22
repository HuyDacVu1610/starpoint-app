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
import { CompetitionsService } from '../services/competitions.service';
import { CreateCompetitionDto } from '../dto/create-competition.dto';
import { UpdateCompetitionDto } from '../dto/update-competition.dto';
import { QueryCompetitionDto } from '../dto/query-competition.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../shared/common/decorators/permissions.decorator';

@Controller('competitions')
@UseGuards(JwtAuthGuard)
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get()
  async findAll(@Query() query: QueryCompetitionDto) {
    return this.competitionsService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.competitionsService.findById(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('MANAGE_COMPETITION')
  async create(@Body() dto: CreateCompetitionDto) {
    return this.competitionsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('MANAGE_COMPETITION')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompetitionDto,
  ) {
    return this.competitionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('MANAGE_COMPETITION')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.competitionsService.delete(id);
  }
}
