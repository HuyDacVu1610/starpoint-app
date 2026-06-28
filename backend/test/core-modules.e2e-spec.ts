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
  CompetitionLevel,
} from '@starpointapp/shared';

describe('Core Modules (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let staffToken: string;
  let studentToken: string;
  let student2Token: string;

  let testSemesterId: number;
  let testCompetitionId: number;
  let student1Id: number;
  let student2Id: number;

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

    // Clean up test semesters to ensure idempotency
    const prisma = moduleFixture.get(PrismaService);
    const existingSemesters = await prisma.semester.findMany({
      where: {
        year: 2026,
        term: 1,
      },
    });

    for (const sem of existingSemesters) {
      await prisma.studentSemesterScore.deleteMany({
        where: { semesterId: sem.id },
      });
      await prisma.scholarshipCandidate.deleteMany({
        where: { semesterId: sem.id },
      });
      await prisma.achievement.deleteMany({
        where: { semesterId: sem.id },
      });
      await prisma.competition.deleteMany({
        where: { semesterId: sem.id },
      });
      await prisma.semester.delete({
        where: { id: sem.id },
      });
    }

    // Login Admin
    let loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ studentCode: 'ADMIN001', password: 'password123' });
    adminToken = loginRes.body.data.accessToken;

    // Login Staff
    loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ studentCode: 'STAFF001', password: 'password123' });
    staffToken = loginRes.body.data.accessToken;

    // Login Student 1
    loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ studentCode: 'SV001', password: 'password123' });
    studentToken = loginRes.body.data.accessToken;
    student1Id = loginRes.body.data.user.id;

    // Login Student 2
    loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ studentCode: 'SV002', password: 'password123' });
    student2Token = loginRes.body.data.accessToken;
    student2Id = loginRes.body.data.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Semesters CRUD', () => {
    it('should allow ADMIN to create a semester', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/semesters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Học kỳ 1 Năm học 2026-2027',
          year: 2026,
          term: 1,
          startDate: '2026-05-01T00:00:00.000Z',
          endDate: '2026-12-31T00:00:00.000Z',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      testSemesterId = response.body.data.id;
    });

    it('should block non-ADMIN from creating a semester', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/semesters')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          name: 'Test Sem',
          year: 2026,
          term: 2,
          startDate: '2027-02-01T00:00:00.000Z',
          endDate: '2027-06-15T00:00:00.000Z',
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should fail when creating a duplicate year/term semester', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/semesters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Học kỳ Trùng',
          year: 2026,
          term: 1,
          startDate: '2026-09-01T00:00:00.000Z',
          endDate: '2027-01-15T00:00:00.000Z',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('đã tồn tại');
    });

    it('should allow anyone authenticated to view semesters list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/semesters')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Competitions CRUD', () => {
    it('should allow ADMIN to create a competition', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/competitions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Olympic Tin Học 2026',
          level: CompetitionLevel.CENTRAL,
          organizer: 'Hội Tin Học VN',
          eventDate: '2026-11-20T00:00:00.000Z',
          semesterId: testSemesterId,
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      testCompetitionId = response.body.data.id;
    });

    it('should block non-ADMIN from creating a competition', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/competitions')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          name: 'Staff Comp',
          level: CompetitionLevel.ACADEMY,
          eventDate: '2026-11-20T00:00:00.000Z',
          semesterId: testSemesterId,
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should restrict deleting semester when competitions exist', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/semesters/${testSemesterId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Không thể xoá học kỳ này');
    });
  });

  describe('Achievements CRUD', () => {
    let testAchievementId: number;

    it('should allow STUDENT to self-submit achievement (defaults to PENDING)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/achievements')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          semesterId: testSemesterId,
          category: AchievementCategory.CENTRAL_COMPETITION,
          competitionId: testCompetitionId,
          rank: AchievementRank.FIRST,
          note: 'Huy chương Vàng',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.userId).toBe(student1Id); // Forced to self
      expect(response.body.data.status).toBe(AchievementStatus.PENDING); // Forced to PENDING
      expect(response.body.data.bonusPoint).toBe(0.4); // Auto calculated CENTRAL_COMPETITION + FIRST = 0.4
      testAchievementId = response.body.data.id;
    });

    it('should allow STUDENT to view their own achievements at /my', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/achievements/my')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(
        (response.body.data.data as Array<{ id: number }>).some(
          (a) => a.id === testAchievementId,
        ),
      ).toBe(true);
    });

    it('should block STUDENT from listing all achievements', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/achievements')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should block STUDENT from updating other student achievements', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/achievements/${testAchievementId}`)
        .set('Authorization', `Bearer ${student2Token}`)
        .send({ rank: AchievementRank.SECOND })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow STAFF/ADMIN to review and approve achievement', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/achievements/${testAchievementId}/review`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: AchievementStatus.APPROVED })
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(AchievementStatus.APPROVED);
    });

    it('should block STUDENT from updating their achievement once APPROVED', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/achievements/${testAchievementId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ note: 'Can I change this?' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        'Không thể chỉnh sửa thành tích đã được xử lý',
      );
    });

    it('should allow STAFF/ADMIN to CRUD achievements directly (defaults to APPROVED)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/achievements')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          userId: student2Id,
          semesterId: testSemesterId,
          category: AchievementCategory.ORGANIZATION_PARTICIPATION,
          rank: AchievementRank.NONE,
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(student2Id);
      expect(response.body.data.status).toBe(AchievementStatus.APPROVED); // Defaults to APPROVED
      expect(response.body.data.bonusPoint).toBe(0.1); // Auto calculated ORGANIZATION_PARTICIPATION + NONE = 0.1
    });
  });
});
