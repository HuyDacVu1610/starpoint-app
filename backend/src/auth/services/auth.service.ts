import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Injectable()
export class AuthService {
  // In-memory store for active refresh tokens
  private activeRefreshTokens = new Map<number, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        studentCode: dto.studentCode,
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    // Extract roles and permissions
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name),
        ),
      ),
    );

    const tokens = await this.generateTokens(
      user.id,
      user.studentCode,
      user.email,
      roles,
      permissions,
    );

    // Store refresh token in memory
    this.activeRefreshTokens.set(user.id, tokens.refreshToken);

    // Remove password from returned user object
    const userWithoutPassword = { ...user } as Partial<typeof user>;
    delete userWithoutPassword.password;

    return {
      ...tokens,
      user: {
        ...userWithoutPassword,
        roles,
        permissions,
      },
    };
  }

  logout(userId: number) {
    this.activeRefreshTokens.delete(userId);
    return {
      success: true,
      message: 'Đăng xuất thành công',
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const storedToken = this.activeRefreshTokens.get(userId);
    if (!storedToken || storedToken !== refreshToken) {
      throw new ForbiddenException(
        'Yêu cầu bị từ chối: Phiên làm việc không hợp lệ',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('Người dùng không tồn tại');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name),
        ),
      ),
    );

    const tokens = await this.generateTokens(
      user.id,
      user.studentCode,
      user.email,
      roles,
      permissions,
    );

    // Rotate refresh token
    this.activeRefreshTokens.set(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name),
        ),
      ),
    );

    const userWithoutPassword = { ...user } as Partial<typeof user>;
    delete userWithoutPassword.password;

    return {
      user: {
        ...userWithoutPassword,
        roles,
        permissions,
      },
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không hợp lệ');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    const newHashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });

    return {
      success: true,
      message: 'Đổi mật khẩu thành công',
    };
  }

  private async generateTokens(
    userId: number,
    studentCode: string,
    email: string,
    roles: string[],
    permissions: string[],
  ) {
    const payload = {
      sub: userId,
      studentCode,
      email,
      roles,
      permissions,
    };

    const accessTokenSecret =
      this.config.get<string>('JWT_SECRET') ||
      'dev-jwt-access-secret-key-1234567890-abcdef';
    const refreshTokenSecret =
      this.config.get<string>('JWT_REFRESH_SECRET') ||
      'dev-jwt-refresh-secret-key-0987654321-fedcba';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessTokenSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(
        { sub: userId, studentCode, email },
        {
          secret: refreshTokenSecret,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
