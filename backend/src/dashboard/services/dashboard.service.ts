import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getStats(semesterId: number) {
    const cacheKey = `dashboard:stats:${semesterId}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const [totalStudents, totalCompetitions, totalAchievements, eligibleScholarships] = await Promise.all([
      // Count total student accounts
      this.prisma.user.count({
        where: {
          userRoles: {
            some: {
              role: {
                name: 'STUDENT',
              },
            },
          },
        },
      }),

      // Count competitions for the given semester
      this.prisma.competition.count({
        where: { semesterId },
      }),

      // Count approved achievements for the given semester
      this.prisma.achievement.count({
        where: { semesterId, status: 'APPROVED' },
      }),

      // Count eligible scholarship candidates for the given semester
      this.prisma.scholarshipCandidate.count({
        where: { semesterId, isEligible: true },
      }),
    ]);

    const result = {
      totalStudents,
      totalCompetitions,
      totalAchievements,
      eligibleScholarships,
    };

    await this.cacheManager.set(cacheKey, result, 300 * 1000); // 5 minutes in ms
    return result;
  }

  async getCharts(semesterId: number) {
    const cacheKey = `dashboard:charts:${semesterId}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const [achievementsByCategory, gpaGradeDistribution] = await Promise.all([
      // Group approved achievements by category
      this.prisma.achievement.groupBy({
        by: ['category'],
        where: { semesterId, status: 'APPROVED' },
        _count: {
          id: true,
        },
      }),

      // Group student scores by their extended GPA grade
      this.prisma.studentSemesterScore.groupBy({
        by: ['gpaGrade'],
        where: { semesterId },
        _count: {
          id: true,
        },
      }),
    ]);

    // Format category data to match category enums nicely
    const categoryData = achievementsByCategory.map((item) => ({
      category: item.category,
      count: item._count.id,
    }));

    // Format grade data
    const gradeData = gpaGradeDistribution.map((item) => ({
      grade: item.gpaGrade,
      count: item._count.id,
    }));

    const result = {
      categoryData,
      gradeData,
    };

    await this.cacheManager.set(cacheKey, result, 300 * 1000); // 5 minutes in ms
    return result;
  }

  async clearCache(semesterId: number) {
    const keys = [`dashboard:stats:${semesterId}`, `dashboard:charts:${semesterId}`];
    for (const key of keys) {
      await this.cacheManager.del(key);
    }
  }
}

