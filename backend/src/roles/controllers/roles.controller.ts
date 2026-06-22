import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
  Request as NestRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../shared/common/decorators/permissions.decorator';

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

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('VIEW_USER')
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('VIEW_USER')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findById(id);
  }

  @Post()
  async create(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: CreateRoleDto,
  ) {
    this.checkAdminRole(req.user.roles);
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  async update(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    this.checkAdminRole(req.user.roles);
    return this.rolesService.update(id, dto);
  }

  private checkAdminRole(roles: string[]) {
    if (!roles.includes('ADMIN')) {
      throw new ForbiddenException(
        'Yêu cầu bị từ chối: Chỉ quản trị viên hệ thống mới có quyền này',
      );
    }
  }
}
