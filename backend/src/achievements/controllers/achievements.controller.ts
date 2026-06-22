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
  ForbiddenException,
  Request as NestRequest,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { AchievementsService } from '../services/achievements.service';
import { CreateAchievementDto } from '../dto/create-achievement.dto';
import { UpdateAchievementDto } from '../dto/update-achievement.dto';
import { QueryAchievementDto } from '../dto/query-achievement.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../shared/common/decorators/permissions.decorator';
import { AchievementStatus } from '@starpointapp/shared';

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

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('VIEW_ACHIEVEMENT')
  async findAll(@Query() query: QueryAchievementDto) {
    return this.achievementsService.findAll(query);
  }

  @Get('my')
  async findMy(
    @Query() query: QueryAchievementDto,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    // Force student filter
    query.userId = req.user.id;
    return this.achievementsService.findAll(query);
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.achievementsService.findById(id, req.user);
  }

  @Post()
  async create(
    @Body() dto: CreateAchievementDto,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    const isStudent = req.user.roles.includes('STUDENT');
    const hasManage = req.user.permissions.includes('MANAGE_ACHIEVEMENT');

    if (!isStudent && !hasManage) {
      throw new ForbiddenException('Bạn không có quyền tạo thành tích');
    }

    return this.achievementsService.create(dto, req.user);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAchievementDto,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    const isStudent = req.user.roles.includes('STUDENT');
    const hasManage = req.user.permissions.includes('MANAGE_ACHIEVEMENT');

    if (!isStudent && !hasManage) {
      throw new ForbiddenException('Bạn không có quyền cập nhật thành tích');
    }

    return this.achievementsService.update(id, dto, req.user);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    const isStudent = req.user.roles.includes('STUDENT');
    const hasManage = req.user.permissions.includes('MANAGE_ACHIEVEMENT');

    if (!isStudent && !hasManage) {
      throw new ForbiddenException('Bạn không có quyền xoá thành tích');
    }

    return this.achievementsService.delete(id, req.user);
  }

  @Patch(':id/review')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('MANAGE_ACHIEVEMENT')
  async review(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: AchievementStatus,
  ) {
    if (!status || !Object.values(AchievementStatus).includes(status)) {
      throw new BadRequestException('Trạng thái duyệt không hợp lệ');
    }
    return this.achievementsService.review(id, status);
  }
}
