import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RolesRepository } from '../repositories/roles.repository';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async findAll() {
    return this.rolesRepository.findAll();
  }

  async findById(id: number) {
    const role = await this.rolesRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Vai trò với ID ${id} không tồn tại`);
    }
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.rolesRepository.findByName(dto.name);
    if (existing) {
      throw new BadRequestException(`Vai trò với tên "${dto.name}" đã tồn tại`);
    }
    return this.rolesRepository.create(
      dto.name,
      dto.description,
      dto.permissionIds,
    );
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.findById(id);

    if (dto.name && dto.name !== role.name) {
      const existing = await this.rolesRepository.findByName(dto.name);
      if (existing) {
        throw new BadRequestException(
          `Vai trò với tên "${dto.name}" đã tồn tại`,
        );
      }
    }

    return this.rolesRepository.update(id, dto);
  }
}
