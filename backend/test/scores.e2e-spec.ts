/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as xlsx from 'xlsx';
import { AppModule } from './../src/app.module';
import { GlobalExceptionFilter } from './../src/shared/common/filters/global-exception.filter';
import { ResponseInterceptor } from './../src/shared/common/interceptors/response.interceptor';
import { PrismaService } from './../src/prisma/prisma.service';
import {
  AchievementCategory,
  AchievementRank,
  AchievementStatus,
} from '@starpointapp/shared';

describe('Scores Module (e2e)', () => {
  let app: INestApplication<App>;
  let staffToken: string;
  let studentToken: string;

  let testSemesterId: number;
  let student1Id: number;
  let student2Id: number;

  function createExcelBuffer(data: any[]): Buffer {
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Scores');
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

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

    // Clean up past E2E test semesters to ensure idempotency
    const existingSemesters = await prisma.semester.findMany({
      where: {
        year: 2029,
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

    // Create a fresh test semester
    const sem = await prisma.semester.create({
      data: {
        name: 'Học kỳ 1 Năm học 2029-2030',
        year: 2029,
        term: 1,
        startDate: new Date('2029-09-01T00:00:00.000Z'),
        endDate: new Date('2030-01-15T00:00:00.000Z'),
      },
    });
    testSemesterId = sem.id;

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

    // Fetch Student 2 ID directly from database to avoid unused student2Token
    const sv2 = await prisma.user.findUnique({
      where: { studentCode: 'SV002' },
    });
    student2Id = sv2!.id;

    // Seed some achievements for SV001 and SV002
    await prisma.achievement.create({
      data: {
        userId: student1Id,
        semesterId: testSemesterId,
        category: AchievementCategory.CENTRAL_COMPETITION,
        rank: AchievementRank.FIRST,
        bonusPoint: 0.4,
        status: AchievementStatus.APPROVED,
      },
    });

    await prisma.achievement.create({
      data: {
        userId: student2Id,
        semesterId: testSemesterId,
        category: AchievementCategory.ACADEMY_COMPETITION,
        rank: AchievementRank.SECOND,
        bonusPoint: 0.15,
        status: AchievementStatus.APPROVED,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/scores/import', () => {
    it('should block STUDENT from importing scores', async () => {
      const buffer = createExcelBuffer([{ MSSV: 'SV001', GPA: 3.5, ĐRL: 85 }]);

      await request(app.getHttpServer())
        .post('/api/v1/scores/import')
        .set('Authorization', `Bearer ${studentToken}`)
        .field('semesterId', testSemesterId)
        .attach('file', buffer, 'scores.xlsx')
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should fail if student code is duplicated inside the Excel sheet', async () => {
      const buffer = createExcelBuffer([
        { MSSV: 'SV001', GPA: 3.5, ĐRL: 85 },
        { MSSV: 'SV001', GPA: 3.2, ĐRL: 90 }, // Duplicate!
      ]);

      const response = await request(app.getHttpServer())
        .post('/api/v1/scores/import')
        .set('Authorization', `Bearer ${staffToken}`)
        .field('semesterId', testSemesterId)
        .attach('file', buffer, 'scores.xlsx')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(
        expect.stringContaining('bị trùng lặp'),
      );
    });

    it('should fail if student GPA or conductScore is out of bounds', async () => {
      const buffer = createExcelBuffer([
        { MSSV: 'SV001', GPA: 4.5, ĐRL: 85 }, // GPA > 4
        { MSSV: 'SV002', GPA: 3.5, ĐRL: 120 }, // Conduct > 100
      ]);

      const response = await request(app.getHttpServer())
        .post('/api/v1/scores/import')
        .set('Authorization', `Bearer ${staffToken}`)
        .field('semesterId', testSemesterId)
        .attach('file', buffer, 'scores.xlsx')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should import scores successfully and calculate uncapped extended GPA', async () => {
      // SV001 achievements points = 0.4. Base GPA = 3.8. Extended GPA = 3.8 + 0.4 = 4.2 (uncapped!)
      // SV002 achievements points = 0.15. Base GPA = 3.5. Extended GPA = 3.5 + 0.15 = 3.65
      const buffer = createExcelBuffer([
        { studentCode: 'SV001', gpa: 3.8, conductScore: 92 },
        { studentCode: 'SV002', gpa: 3.5, conductScore: 82 },
      ]);

      const response = await request(app.getHttpServer())
        .post('/api/v1/scores/import')
        .set('Authorization', `Bearer ${staffToken}`)
        .field('semesterId', testSemesterId)
        .attach('file', buffer, 'scores.xlsx')
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);

      // Verify DB records
      const prisma = app.get(PrismaService);
      const score1 = await prisma.studentSemesterScore.findUnique({
        where: {
          userId_semesterId: { userId: student1Id, semesterId: testSemesterId },
        },
      });
      expect(score1).toBeDefined();
      expect(score1!.gpa).toBe(3.8);
      expect(score1!.maxBonusPoint).toBe(0.4);
      expect(score1!.extendedGpa).toBe(4.2); // Not capped at 4.00!
      expect(score1!.gpaGrade).toBe('EXCELLENT');

      const score2 = await prisma.studentSemesterScore.findUnique({
        where: {
          userId_semesterId: { userId: student2Id, semesterId: testSemesterId },
        },
      });
      expect(score2).toBeDefined();
      expect(score2!.extendedGpa).toBe(3.65);
    });

    it('should auto-create a student with default name and email if they do not exist in the system during Excel import', async () => {
      // SV_NEW does not exist in the database.
      // We do not provide Name or Email, so they should be auto-created using default values.
      const buffer = createExcelBuffer([
        { studentCode: 'SV_NEW', gpa: 3.2, conductScore: 88 },
      ]);

      const response = await request(app.getHttpServer())
        .post('/api/v1/scores/import')
        .set('Authorization', `Bearer ${staffToken}`)
        .field('semesterId', testSemesterId)
        .attach('file', buffer, 'scores.xlsx')
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);

      // Verify DB records
      const prisma = app.get(PrismaService);
      const newStudent = await prisma.user.findUnique({
        where: { studentCode: 'SV_NEW' },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
      expect(newStudent).toBeDefined();
      expect(newStudent!.fullName).toBe('Sinh viên SV_NEW');
      expect(newStudent!.email).toBe('sv_new@starpoint.edu.vn');
      expect(newStudent!.userRoles.length).toBe(1);
      expect(newStudent!.userRoles[0].role.name).toBe('STUDENT');

      const score = await prisma.studentSemesterScore.findUnique({
        where: {
          userId_semesterId: { userId: newStudent!.id, semesterId: testSemesterId },
        },
      });
      expect(score).toBeDefined();
      expect(score!.gpa).toBe(3.2);
      expect(score!.conductScore).toBe(88);
    });
  });

  describe('GET /api/v1/scores', () => {
    it('should allow STAFF to view scores list', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/scores?semesterId=${testSemesterId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(3);
    });

    it('should allow STUDENT to view their own scores at /my', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/scores/my?semesterId=${testSemesterId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data[0].userId).toBe(student1Id);
    });
  });

  describe('PATCH /api/v1/semesters/:semesterId/students/:studentCode', () => {
    it('should block STUDENT from updating scores', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/semesters/${testSemesterId}/students/SV001`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ gpa: 3.9 })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow STAFF to edit scores and trigger automatic recalculations', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/semesters/${testSemesterId}/students/SV001`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ gpa: 3.7, conductScore: 89 })
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gpa).toBe(3.7);
      expect(response.body.data.conductScore).toBe(89);
      expect(response.body.data.extendedGpa).toBe(4.1); // 3.7 + 0.4
      expect(response.body.data.conductGrade).toBe('GOOD'); // 89 is GOOD
    });
  });

  describe('POST /api/v1/scores/calculate/:semesterId', () => {
    it('should block STUDENT from triggering bulk calculation', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/scores/calculate/${testSemesterId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow STAFF to trigger bulk calculation successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/scores/calculate/${testSemesterId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('message');
    });
  });
});
