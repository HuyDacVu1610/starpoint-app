import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/shared/common/filters/global-exception.filter';
import { ResponseInterceptor } from '../src/shared/common/interceptors/response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Dashboard Module (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let studentToken: string;
  let testSemesterId: number;

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

    // Fetch or create a semester for tests
    const sem = await prisma.semester.findFirst() || await prisma.semester.create({
      data: {
        name: 'Dashboard Test Semester',
        year: 2028,
        term: 1,
        startDate: new Date('2028-09-01T00:00:00.000Z'),
        endDate: new Date('2029-01-15T00:00:00.000Z'),
      },
    });
    testSemesterId = sem.id;

    // Login Admin
    let loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ studentCode: 'ADMIN001', password: 'password123' });
    adminToken = loginRes.body.data.accessToken;

    // Login Student
    loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ studentCode: 'SV001', password: 'password123' });
    studentToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/dashboard/stats', () => {
    it('should block STUDENT from reading dashboard stats', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/dashboard/stats?semesterId=${testSemesterId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return live stats for ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/dashboard/stats?semesterId=${testSemesterId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalStudents');
      expect(response.body.data).toHaveProperty('totalCompetitions');
      expect(response.body.data).toHaveProperty('totalAchievements');
      expect(response.body.data).toHaveProperty('eligibleScholarships');
      expect(typeof response.body.data.totalStudents).toBe('number');
    });
  });

  describe('GET /api/v1/dashboard/charts', () => {
    it('should block STUDENT from reading dashboard charts', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/dashboard/charts?semesterId=${testSemesterId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return charts dataset for ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/dashboard/charts?semesterId=${testSemesterId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('categoryData');
      expect(response.body.data).toHaveProperty('gradeData');
      expect(response.body.data.categoryData).toBeInstanceOf(Array);
      expect(response.body.data.gradeData).toBeInstanceOf(Array);
    });
  });
});
