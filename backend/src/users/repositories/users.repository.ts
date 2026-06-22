import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryUserDto } from '../dto/query-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryUserDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { studentCode: { contains: query.search } },
        { fullName: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = (query.sortOrder || 'desc').toLowerCase() as
      | 'asc'
      | 'desc';
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      data,
    };
  }

  async findById(id: number) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findByStudentCode(studentCode: string) {
    return this.prisma.user.findFirst({
      where: { studentCode, deletedAt: null },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.UserCreateInput, roleIds: number[]) {
    return this.prisma.user.create({
      data: {
        ...data,
        userRoles: {
          create: roleIds.map((roleId) => ({
            roleId,
          })),
        },
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput, roleIds?: number[]) {
    if (roleIds !== undefined) {
      return this.prisma.$transaction(async (tx) => {
        await tx.userRole.deleteMany({
          where: { userId: id },
        });

        return tx.user.update({
          where: { id },
          data: {
            ...data,
            userRoles: {
              create: roleIds.map((roleId) => ({
                roleId,
              })),
            },
          },
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });
      });
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async softDelete(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
