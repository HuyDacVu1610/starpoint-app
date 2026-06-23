import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import request from 'supertest';
import { App } from 'supertest/types';
import { GlobalExceptionFilter } from '../src/shared/common/filters/global-exception.filter';
import { ResponseInterceptor } from '../src/shared/common/interceptors/response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Infrastructure & Polish (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.TEST_RATE_LIMIT = 'true';
    const { AppModule } = require('../src/app.module');

    // Compile testing module with Cache and RabbitMQ mocked to bypass slow/missing local services
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CACHE_MANAGER)
      .useValue({
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue(undefined),
        del: jest.fn().mockResolvedValue(undefined),
        clear: jest.fn().mockResolvedValue(undefined),
      })
      .overrideProvider('RABBITMQ_CLIENT')
      .useValue({
        emit: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve() }),
        send: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve() }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();

    prisma = moduleFixture.get(PrismaService);

    // Login Admin to get token
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ studentCode: 'ADMIN001', password: 'password123' });
    adminToken = loginRes.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    await app.close();
  }, 10000);

  describe('Audit Logging', () => {
    it('should log CREATE action when creating a semester', async () => {
      const year = Math.floor(Math.random() * 1000) + 5000; // Unique year
      const semesterData = {
        name: `Audit Log Test Semester ${year}`,
        year,
        term: 1,
        startDate: '2026-09-01T00:00:00.000Z',
        endDate: '2027-01-15T00:00:00.000Z',
      };

      // Create semester - this route is decorated with @LogAction('CREATE', 'SEMESTER')
      const res = await request(app.getHttpServer())
        .post('/api/v1/semesters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(semesterData);
      
      if (res.status !== HttpStatus.CREATED) {
        console.log('Failed to create semester. Status:', res.status, 'Body:', res.body);
      }
      expect(res.status).toBe(HttpStatus.CREATED);

      // Wait for async audit log write to complete
      await sleep(200);

      // Check audit logs
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit-logs?limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBeGreaterThan(0);
      
      const log = response.body.data.items.find(
        (item: any) => item.action === 'CREATE' && item.module === 'SEMESTER',
      );
      expect(log).toBeDefined();
      expect(log.user.studentCode).toBe('ADMIN001');
    });
  });

  describe('Global Rate Limiting', () => {
    it('should return 429 Too Many Requests when request limit is exceeded', async () => {
      // Send 65 requests rapidly to trigger rate limit (global is 60 req/min)
      let lastStatus = 200;
      for (let i = 0; i < 65; i++) {
        const res = await request(app.getHttpServer())
          .get('/api/v1/semesters')
          .set('Authorization', `Bearer ${adminToken}`);
        lastStatus = res.status;
        if (lastStatus === HttpStatus.TOO_MANY_REQUESTS) {
          break;
        }
      }
      expect(lastStatus).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }, 30000); // 30 seconds timeout
  });
});
