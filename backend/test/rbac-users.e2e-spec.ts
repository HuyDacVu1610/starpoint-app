/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { GlobalExceptionFilter } from './../src/shared/common/filters/global-exception.filter';
import { ResponseInterceptor } from './../src/shared/common/interceptors/response.interceptor';

import { PrismaService } from './../src/prisma/prisma.service';

describe('RBAC & Users CRUD (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let staffToken: string;
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

    // Clean up test data before runs to ensure idempotency
    const prisma = moduleFixture.get(PrismaService);
    await prisma.user.deleteMany({
      where: {
        studentCode: {
          in: ['SV006', 'SV999'],
        },
      },
    });

    // Acquire tokens
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ studentCode: 'ADMIN001', password: 'password123' });
    adminToken = adminLogin.body.data.accessToken;

    const staffLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ studentCode: 'STAFF001', password: 'password123' });
    staffToken = staffLogin.body.data.accessToken;

    const studentLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ studentCode: 'SV001', password: 'password123' });
    studentToken = studentLogin.body.data.accessToken;
  });

  afterAll(async () => {
    const prisma = app.get(PrismaService);
    await prisma.user.deleteMany({
      where: {
        studentCode: {
          in: ['SV006', 'SV999'],
        },
      },
    });
    await app.close();
  });

  describe('Roles & Permissions Endpoints', () => {
    it('GET /roles - should return list of roles for ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.map((r: any) => r.name)).toContain('ADMIN');
      expect(response.body.data.map((r: any) => r.name)).toContain('STAFF');
      expect(response.body.data.map((r: any) => r.name)).toContain('STUDENT');
    });

    it('GET /roles - should forbid non-admin and non-staff (e.g. STUDENT)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('GET /permissions - should return permissions list for ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.map((p: any) => p.name)).toContain(
        'CREATE_USER',
      );
    });
  });

  describe('Users Query, Pagination & Sort', () => {
    it('GET /users - should return paginated users for ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toBeInstanceOf(Array);
      expect(response.body.data.meta.page).toBe(1);
      expect(response.body.data.meta.limit).toBe(5);
      expect(response.body.data.meta.total).toBeGreaterThanOrEqual(7); // seeded count
    });

    it('GET /users - should filter users by search query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users?search=Nam')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      const studentNames = response.body.data.data.map((u: any) => u.fullName);
      expect(studentNames).toContain('Nguyễn Văn Nam');
      // Should not contain others unless their name has 'Nam'
    });

    it('GET /users - should sort users correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users?sortBy=studentCode&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      const codes = response.body.data.data.map((u: any) => u.studentCode);
      const sortedCodes = [...codes].sort();
      expect(codes).toEqual(sortedCodes);
    });

    it('GET /users - should forbid STAFF from reading users', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('User CRUD Operations', () => {
    let newUserId: number;

    it('POST /users - should create user SV006 successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentCode: 'SV006',
          fullName: 'Nguyễn Văn Sáu',
          email: 'sv006@starpoint.dev',
          phone: '0909090909',
          password: 'password123',
          roleIds: [3], // STUDENT is typically id 3
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data.studentCode).toBe('SV006');
      expect(response.body.data.roles).toContain('STUDENT');
      newUserId = response.body.data.id;
    });

    it('POST /users - should fail with duplicate studentCode', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentCode: 'SV006',
          fullName: 'Duplicate Code User',
          email: 'duplicatecode@starpoint.dev',
          password: 'password123',
          roleIds: [3],
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('đã tồn tại');
    });

    it('POST /users - should fail with duplicate email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentCode: 'SV999',
          fullName: 'Duplicate Email User',
          email: 'sv006@starpoint.dev',
          password: 'password123',
          roleIds: [3],
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('đã được đăng ký');
    });

    it('PATCH /users/:id - should update user details successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/users/${newUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Nguyễn Văn Sáu Đã Đổi Tên',
        })
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fullName).toBe('Nguyễn Văn Sáu Đã Đổi Tên');
    });

    it('DELETE /users/:id - should soft delete user successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/users/${newUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Xoá người dùng thành công');

      // Verify the user cannot log in anymore
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          studentCode: 'SV006',
          password: 'password123',
        })
        .expect(HttpStatus.UNAUTHORIZED);

      // Verify user is not in the active users list
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      const codes = listRes.body.data.data.map((u: any) => u.studentCode);
      expect(codes).not.toContain('SV006');
    });
  });
});
