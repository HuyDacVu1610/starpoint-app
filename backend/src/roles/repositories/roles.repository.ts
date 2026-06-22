import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findById(id: number) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  async create(
    name: string,
    description?: string,
    permissionIds: number[] = [],
  ) {
    return this.prisma.role.create({
      data: {
        name,
        description,
        rolePermissions: {
          create: permissionIds.map((pId) => ({
            permissionId: pId,
          })),
        },
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    data: { name?: string; description?: string; permissionIds?: number[] },
  ) {
    const updateData: { name?: string; description?: string } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;

    if (data.permissionIds !== undefined) {
      // Use transaction to delete old mappings and add new mappings
      return this.prisma.$transaction(async (tx) => {
        await tx.rolePermission.deleteMany({
          where: { roleId: id },
        });

        return tx.role.update({
          where: { id },
          data: {
            ...updateData,
            rolePermissions: {
              create: data.permissionIds!.map((pId) => ({
                permissionId: pId,
              })),
            },
          },
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        });
      });
    }

    return this.prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }
}
