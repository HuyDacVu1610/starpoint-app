import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionsService } from '../services/permissions.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../shared/common/decorators/permissions.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('VIEW_USER')
  async findAll() {
    return this.permissionsService.findAll();
  }
}
