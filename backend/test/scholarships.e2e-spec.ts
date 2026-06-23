/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { GlobalExceptionFilter } from './../src/shared/common/filters/global-exception.filter';
import { ResponseInterceptor } from './../src/shared/common/interceptors/response.interceptor';
import { PrismaService } from './../src/prisma/prisma.service';
import {
  AchievementCategory,
  AchievementRank,
  AchievementStatus,
  Grade,
} from '@prisma/client';

describe('Scholarships Module (e2e)', () => {
  let app: INestApplication<App>;
  let staffToken: string;
  let studentToken: string;

  let testSemesterId: number;
  let testCompetitionId: number;
  let student1Id: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();

    const prisma = moduleFixture.get(PrismaService);

    // Clean up E2E semesters to ensure idempotency
    const existingSemesters = await prisma.semester.findMany({
      where: {
        year: 2031,
        term: 1,
      },
    });

    for (const sem of existingSemesters) {
      await prisma.scholarshipCandidate.deleteMany({
        where: { semesterId: sem.id },
      });
      await prisma.studentSemesterScore.deleteMany({
        where: { semesterId: sem.id },
      });
      await prisma.achievement.deleteMany({ where: { semesterId: sem.id } });
      await prisma.competition.deleteMany({ where: { semesterId: sem.id } });
      await prisma.semester.delete({ where: { id: sem.id } });
    }

    // Create fresh semester
    const sem = await prisma.semester.create({
      data: {
        name: 'Học kỳ 1 Năm học 2031-2032',
        year: 2031,
        term: 1,
        startDate: new Date('2031-09-01T00:00:00.000Z'),
        endDate: new Date('2032-01-15T00:00:00.000Z'),
      },
    });
    testSemesterId = sem.id;

    // Create fresh CENTRAL competition
    const comp = await prisma.competition.create({
      data: {
        name: 'Olympic Tin Học Quốc Gia 2031',
        level: 'CENTRAL',
        eventDate: new Date('2031-11-20T00:00:00.000Z'),
        semesterId: testSemesterId,
      },
    });
    testCompetitionId = comp.id;

    // Login Staff
    let loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ studentCode: 'STAFF001', password: 'password123' });
    staffToken = loginRes.body.data.accessToken;

    // Login Student 1
    loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ studentCode: 'SV001', password: 'password123' });
    studentToken = loginRes.body.data.accessToken;
    student1Id = loginRes.body.data.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Scholarship Evaluation & Matrix calculations', () => {
    it('should calculate matrix-based min-matching tiers correctly', async () => {
      const prisma = app.get(PrismaService);

      // Create several student semester scores to test different cross matrix conditions
      // Admin seeded users: SV001, SV002, SV003, SV004, SV005
      const sv1 = await prisma.user.findUnique({
        where: { studentCode: 'SV001' },
      });
      const sv2 = await prisma.user.findUnique({
        where: { studentCode: 'SV002' },
      });
      const sv3 = await prisma.user.findUnique({
        where: { studentCode: 'SV003' },
      });
      const sv4 = await prisma.user.findUnique({
        where: { studentCode: 'SV004' },
      });

      // SV001: GPA 3.7 (EXCELLENT), Conduct 95 (EXCELLENT) -> EXCELLENT tier
      await prisma.studentSemesterScore.create({
        data: {
          userId: sv1!.id,
          semesterId: testSemesterId,
          gpa: 3.7,
          extendedGpa: 3.7,
          conductScore: 95,
          gpaGrade: Grade.EXCELLENT,
          conductGrade: Grade.EXCELLENT,
        },
      });

      // SV002: GPA 3.7 (EXCELLENT), Conduct 85 (GOOD) -> GOOD tier
      await prisma.studentSemesterScore.create({
        data: {
          userId: sv2!.id,
          semesterId: testSemesterId,
          gpa: 3.7,
          extendedGpa: 3.7,
          conductScore: 85,
          gpaGrade: Grade.EXCELLENT,
          conductGrade: Grade.GOOD,
        },
      });

      // SV003: GPA 3.0 (FAIR), Conduct 95 (EXCELLENT) -> FAIR tier
      await prisma.studentSemesterScore.create({
        data: {
          userId: sv3!.id,
          semesterId: testSemesterId,
          gpa: 3.0,
          extendedGpa: 3.0,
          conductScore: 95,
          gpaGrade: Grade.FAIR,
          conductGrade: Grade.EXCELLENT,
        },
      });

      // SV004: GPA 3.4 (GOOD), Conduct 65 (AVERAGE) -> Ineligible (isEligible=false, scholarshipTier=null)
      await prisma.studentSemesterScore.create({
        data: {
          userId: sv4!.id,
          semesterId: testSemesterId,
          gpa: 3.4,
          extendedGpa: 3.4,
          conductScore: 65,
          gpaGrade: Grade.GOOD,
          conductGrade: Grade.AVERAGE,
        },
      });

      // Trigger Evaluation
      const response = await request(app.getHttpServer())
        .post('/api/v1/scholarships/evaluate')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ semesterId: testSemesterId })
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data.evaluatedCount).toBe(4);
      expect(response.body.data.eligibleCount).toBe(3);
      expect(response.body.data.tierCounts.EXCELLENT).toBe(1);
      expect(response.body.data.tierCounts.GOOD).toBe(1);
      expect(response.body.data.tierCounts.FAIR).toBe(1);

      // Verify SV001 Candidate
      const candidate1 = await prisma.scholarshipCandidate.findFirst({
        where: { userId: sv1!.id, semesterId: testSemesterId },
      });
      expect(candidate1!.isEligible).toBe(true);
      expect(candidate1!.scholarshipTier).toBe(Grade.EXCELLENT);

      // Verify SV002 Candidate
      const candidate2 = await prisma.scholarshipCandidate.findFirst({
        where: { userId: sv2!.id, semesterId: testSemesterId },
      });
      expect(candidate2!.isEligible).toBe(true);
      expect(candidate2!.scholarshipTier).toBe(Grade.GOOD);

      // Verify SV004 Candidate (Ineligible)
      const candidate4 = await prisma.scholarshipCandidate.findFirst({
        where: { userId: sv4!.id, semesterId: testSemesterId },
      });
      expect(candidate4!.isEligible).toBe(false);
      expect(candidate4!.scholarshipTier).toBeNull();
    });
  });

  describe('GET /api/v1/scholarships/candidates & /my', () => {
    it('should allow STAFF to view candidate list', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/scholarships/candidates?semesterId=${testSemesterId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(4);
    });

    it('should allow STUDENT to view their own candidacy status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/scholarships/my?semesterId=${testSemesterId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data[0].userId).toBe(student1Id);
    });
  });

  describe('Reactive update checks', () => {
    it('should reactively recalculate score and update scholarship eligibility when achievements are approved', async () => {
      const prisma = app.get(PrismaService);
      const sv5 = await prisma.user.findUnique({
        where: { studentCode: 'SV005' },
      });

      // SV005 starts with: GPA 3.3 (GOOD), Conduct 92 (EXCELLENT).
      // Since GPA is GOOD and Conduct is EXCELLENT, initial scholarship tier evaluated would be GOOD.
      await prisma.studentSemesterScore.create({
        data: {
          userId: sv5!.id,
          semesterId: testSemesterId,
          gpa: 3.3,
          extendedGpa: 3.3,
          conductScore: 92,
          gpaGrade: Grade.GOOD,
          conductGrade: Grade.EXCELLENT,
        },
      });

      // Run initial evaluation
      await request(app.getHttpServer())
        .post('/api/v1/scholarships/evaluate')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ semesterId: testSemesterId });

      const candidateInitial = await prisma.scholarshipCandidate.findFirst({
        where: { userId: sv5!.id, semesterId: testSemesterId },
      });
      expect(candidateInitial!.scholarshipTier).toBe(Grade.GOOD);

      // Now create a student self-submitted achievement for SV005 (which defaults to PENDING)
      const submitRes = await request(app.getHttpServer())
        .post('/api/v1/achievements')
        .set('Authorization', `Bearer ${studentToken}`) // Login token is SV001's. Let's use staffToken to submit for SV005
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          userId: sv5!.id,
          semesterId: testSemesterId,
          category: AchievementCategory.CENTRAL_COMPETITION,
          competitionId: testCompetitionId,
          rank: AchievementRank.FIRST,
          note: 'Olympic Vàng',
          status: AchievementStatus.PENDING, // Submit as pending first
        })
        .expect(HttpStatus.CREATED);

      const achievementId = submitRes.body.data.id;

      // Ensure base score has not changed yet because it is PENDING
      let score = await prisma.studentSemesterScore.findUnique({
        where: {
          userId_semesterId: { userId: sv5!.id, semesterId: testSemesterId },
        },
      });
      expect(score!.extendedGpa).toBe(3.3);

      // Staff reviews and APPROVES the achievement
      await request(app.getHttpServer())
        .patch(`/api/v1/achievements/${achievementId}/review`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: AchievementStatus.APPROVED })
        .expect(HttpStatus.OK);

      // Verify score reactively recalculated:
      // extended GPA = 3.3 + 0.4 = 3.7. Grade becomes EXCELLENT.
      score = await prisma.studentSemesterScore.findUnique({
        where: {
          userId_semesterId: { userId: sv5!.id, semesterId: testSemesterId },
        },
      });
      expect(score!.extendedGpa).toBe(3.7);
      expect(score!.gpaGrade).toBe(Grade.EXCELLENT);

      // Verify scholarship candidacy reactively re-evaluated:
      // Since extended GPA Grade is now EXCELLENT and Conduct Grade is EXCELLENT,
      // the candidate's scholarship tier must automatically become EXCELLENT!
      const candidateUpdated = await prisma.scholarshipCandidate.findFirst({
        where: { userId: sv5!.id, semesterId: testSemesterId },
      });
      expect(candidateUpdated!.scholarshipTier).toBe(Grade.EXCELLENT);
    });
  });
});
