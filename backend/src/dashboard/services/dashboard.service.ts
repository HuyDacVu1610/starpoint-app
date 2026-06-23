import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(semesterId: number) {
    const [totalStudents, totalCompetitions, totalAchievements, eligibleScholarships] = await Promise.all([
      // Count total non-deleted student accounts
      this.prisma.user.count({
        where: {
          userRoles: {
            some: {
              role: {
                name: 'STUDENT',
              },
            },
          },
          deletedAt: null,
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

    return {
      totalStudents,
      totalCompetitions,
      totalAchievements,
      eligibleScholarships,
    };
  }

  async getCharts(semesterId: number) {
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

    return {
      categoryData,
      gradeData,
    };
  }
}
