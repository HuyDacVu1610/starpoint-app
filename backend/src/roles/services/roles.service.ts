import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findById(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    if (!role) {
      throw new NotFoundException(`Vai trò với ID ${id} không tồn tại`);
    }
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new BadRequestException(`Vai trò với tên "${dto.name}" đã tồn tại`);
    }
    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        rolePermissions: {
          create: (dto.permissionIds || []).map((pId) => ({
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

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.findById(id);

    if (dto.name && dto.name !== role.name) {
      const existing = await this.prisma.role.findUnique({
        where: { name: dto.name },
      });
      if (existing) {
        throw new BadRequestException(
          `Vai trò với tên "${dto.name}" đã tồn tại`,
        );
      }
    }

    const updateData: { name?: string; description?: string } = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;

    if (dto.permissionIds !== undefined) {
      return this.prisma.$transaction(async (tx) => {
        await tx.rolePermission.deleteMany({
          where: { roleId: id },
        });

        return tx.role.update({
          where: { id },
          data: {
            ...updateData,
            rolePermissions: {
              create: dto.permissionIds!.map((pId) => ({
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
