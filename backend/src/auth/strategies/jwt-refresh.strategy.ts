import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

interface JwtPayload {
  sub: number;
  studentCode: string;
  email: string;
  roles?: string[];
  permissions?: string[];
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        config.get<string>('JWT_REFRESH_SECRET') ||
        'dev-jwt-refresh-secret-key-0987654321-fedcba',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = req
      .get('Authorization')
      ?.replace('Bearer ', '')
      .trim();
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is missing');
    }
    return {
      id: payload.sub,
      studentCode: payload.studentCode,
      email: payload.email,
      refreshToken,
    };
  }
}
