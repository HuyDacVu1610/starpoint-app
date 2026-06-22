/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { GlobalExceptionFilter } from './../src/shared/common/filters/global-exception.filter';
import { ResponseInterceptor } from './../src/shared/common/interceptors/response.interceptor';

describe('UploadController (e2e)', () => {
  let app: INestApplication<App>;
  let studentToken: string;

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

    // Login as a student to get a token
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        studentCode: 'SV001',
        password: 'password123',
      });
    studentToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/upload', () => {
    it('should fail if unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/upload')
        .attach('file', Buffer.from('hello'), 'test.png')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should succeed with valid image file', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/upload')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('file', Buffer.from('mock image data'), 'avatar.png')
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.originalName).toBe('avatar.png');
      expect(response.body.data.storedPath).toBeDefined();
      expect(response.body.data.url).toContain('/uploads/');
    });

    it('should fail with invalid file type', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/upload')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('file', Buffer.from('console.log("hello");'), 'script.js')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Định dạng file không được hỗ trợ');
    });

    it('should fail with file exceeding 5MB', async () => {
      // Mock 6MB buffer
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
      const response = await request(app.getHttpServer())
        .post('/api/v1/upload')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('file', largeBuffer, 'huge.pdf')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        'Kích thước file không được vượt quá 5MB',
      );
    });
  });
});
