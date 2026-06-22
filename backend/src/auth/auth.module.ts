import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './services/auth.service';
import { PasswordResetService } from './services/password-reset.service';
import { MailService } from './services/mail.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST') || 'localhost',
          port: config.get<number>('MAIL_PORT') || 1025,
          secure: config.get<number>('MAIL_PORT') === 465,
          auth: config.get<string>('MAIL_USER')
            ? {
                user: config.get<string>('MAIL_USER'),
                pass: config.get<string>('MAIL_PASS'),
              }
            : undefined,
        },
        defaults: {
          from: '"StarPoint" <noreply@starpoint.dev>',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    PasswordResetService,
    MailService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
