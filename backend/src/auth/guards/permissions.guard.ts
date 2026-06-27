import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../../shared/common/decorators/permissions.decorator';

interface UserPayload {
  id: number;
  studentCode: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException(
        'Yêu cầu bị từ chối: Người dùng chưa đăng nhập',
      );
    }

    // Query active permissions from the database
    const dbUser = await this.prisma.user.findFirst({
      where: { id: Number(user.id) },
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

    if (!dbUser) {
      throw new ForbiddenException(
        'Yêu cầu bị từ chối: Tài khoản không tồn tại hoặc đã bị xoá',
      );
    }

    const userPermissions = new Set(
      dbUser.userRoles.flatMap((ur) =>
        ur.role.rolePermissions.map((rp) => rp.permission.name),
      ),
    );

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'Yêu cầu bị từ chối: Bạn không có quyền thực hiện hành động này',
      );
    }

    return true;
  }
}
