import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../shared/common/decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('stats')
  @RequirePermissions('VIEW_DASHBOARD')
  async getStats(@Query('semesterId') semesterId?: string) {
    const semId = await this.resolveSemesterId(semesterId);
    if (!semId) return { totalStudents: 0, totalCompetitions: 0, totalAchievements: 0, eligibleScholarships: 0 };
    return this.dashboardService.getStats(semId);
  }

  @Get('charts')
  @RequirePermissions('VIEW_DASHBOARD')
  async getCharts(@Query('semesterId') semesterId?: string) {
    const semId = await this.resolveSemesterId(semesterId);
    if (!semId) return { categoryData: [], gradeData: [] };
    return this.dashboardService.getCharts(semId);
  }

  private async resolveSemesterId(semesterId?: string): Promise<number | null> {
    if (semesterId) {
      return Number(semesterId);
    }
    // Default to the latest active or chronological semester
    const latest = await this.prisma.semester.findFirst({
      orderBy: { startDate: 'desc' },
    });
    return latest ? latest.id : null;
  }
}
