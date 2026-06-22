/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';

import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { MailService } from './../src/auth/services/mail.service';
import { GlobalExceptionFilter } from './../src/shared/common/filters/global-exception.filter';
import { ResponseInterceptor } from './../src/shared/common/interceptors/response.interceptor';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let mockMailService: {
    sendResetCode: jest.Mock<Promise<void>, [string, string]>;
  };

  beforeAll(async () => {
    mockMailService = {
      sendResetCode: jest.fn().mockResolvedValue(undefined),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mockMailService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should fail validation when studentCode or password is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Mã số sinh viên không được rỗng');
      expect(response.body.errors).toContain('Mật khẩu không được rỗng');
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          studentCode: 'SV001',
          password: 'wrongpassword',
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Mật khẩu không đúng');
    });

    it('should succeed with valid student credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          studentCode: 'SV001',
          password: 'password123',
        })
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.studentCode).toBe('SV001');
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.user.roles).toContain('STUDENT');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should fail when no JWT is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.success).toBe(false);
    });

    it('should succeed when valid JWT is provided', async () => {
      // Login first
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          studentCode: 'SV001',
          password: 'password123',
        });

      const token = loginRes.body.data.accessToken;

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.studentCode).toBe('SV001');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should fail when no refresh token is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.success).toBe(false);
    });

    it('should succeed when valid refresh token is provided', async () => {
      // Login first
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          studentCode: 'SV001',
          password: 'password123',
        });

      const refreshToken = loginRes.body.data.refreshToken;

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should fail when invalid refresh token is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Authorization', 'Bearer invalid-refresh-token')
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should invalidate refresh token after logout', async () => {
      // Login first
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          studentCode: 'SV001',
          password: 'password123',
        });

      const accessToken = loginRes.body.data.accessToken;
      const refreshToken = loginRes.body.data.refreshToken;

      // Logout
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      // Refreshing with the same token should now fail with 403 Forbidden
      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(HttpStatus.FORBIDDEN);

      expect(refreshRes.body.success).toBe(false);
      expect(refreshRes.body.message).toBe(
        'Yêu cầu bị từ chối: Phiên làm việc không hợp lệ',
      );
    });
  });

  describe('PATCH /api/v1/auth/change-password', () => {
    it('should change password successfully and verify login with new password', async () => {
      // Login SV003
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          studentCode: 'SV003',
          password: 'password123',
        });

      const token = loginRes.body.data.accessToken;

      // Change password to newpassword123
      const changeRes = await request(app.getHttpServer())
        .patch('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        })
        .expect(HttpStatus.OK);

      expect(changeRes.body.success).toBe(true);

      // Login with old password should fail
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          studentCode: 'SV003',
          password: 'password123',
        })
        .expect(HttpStatus.UNAUTHORIZED);

      // Login with new password should succeed
      const newLoginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          studentCode: 'SV003',
          password: 'newpassword123',
        })
        .expect(HttpStatus.OK);

      // Restore password to password123 for other tests and database seeding consistency
      const newToken = newLoginRes.body.data.accessToken;
      await request(app.getHttpServer())
        .patch('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${newToken}`)
        .send({
          currentPassword: 'newpassword123',
          newPassword: 'password123',
        })
        .expect(HttpStatus.OK);
    });
  });

  describe('Forgot Password Flow', () => {
    it('should fail forgot password if email does not match student code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({
          studentCode: 'SV002',
          email: 'wrong-email@starpoint.dev',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Mã số sinh viên và email không khớp');
    });

    it('should send email reset code, verify code, and reset password successfully', async () => {
      mockMailService.sendResetCode.mockClear();

      // Request reset
      const forgotRes = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({
          studentCode: 'SV002',
          email: 'sv002@starpoint.dev',
        })
        .expect(HttpStatus.OK);

      expect(forgotRes.body.success).toBe(true);
      expect(mockMailService.sendResetCode).toHaveBeenCalledTimes(1);

      const [calledEmail, calledCode] =
        mockMailService.sendResetCode.mock.calls[0];
      expect(calledEmail).toBe('sv002@starpoint.dev');
      expect(calledCode).toHaveLength(6);

      // Verify code with invalid code should fail
      const verifyFailRes = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-reset-code')
        .send({
          studentCode: 'SV002',
          code: '000000',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(verifyFailRes.body.success).toBe(false);

      // Verify code with correct code should succeed
      const verifySuccessRes = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-reset-code')
        .send({
          studentCode: 'SV002',
          code: calledCode,
        })
        .expect(HttpStatus.OK);

      expect(verifySuccessRes.body.success).toBe(true);

      // Reset password with wrong code should fail
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          studentCode: 'SV002',
          code: '000000',
          newPassword: 'resetpassword123',
        })
        .expect(HttpStatus.BAD_REQUEST);

      // Reset password with correct code should succeed
      const resetSuccessRes = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          studentCode: 'SV002',
          code: calledCode,
          newPassword: 'resetpassword123',
        })
        .expect(HttpStatus.OK);

      expect(resetSuccessRes.body.success).toBe(true);

      // Login with reset password should succeed
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          studentCode: 'SV002',
          password: 'resetpassword123',
        })
        .expect(HttpStatus.OK);

      // Restore password to password123
      const token = loginRes.body.data.accessToken;
      await request(app.getHttpServer())
        .patch('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'resetpassword123',
          newPassword: 'password123',
        })
        .expect(HttpStatus.OK);
    });
  });
});
