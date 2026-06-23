import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(query: QueryUserDto) {
    const { total, data } = await this.usersRepository.findAll(query);

    const formattedUsers = data.map((user) => {
      const userWithoutPassword = { ...user } as Partial<typeof user>;
      delete userWithoutPassword.password;
      return {
        ...userWithoutPassword,
        roles: user.userRoles.map((ur) => ur.role.name),
      };
    });

    return {
      data: formattedUsers,
      meta: {
        page: query.page || 1,
        limit: query.limit || 10,
        total,
      },
    };
  }

  async findById(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Người dùng với ID ${id} không tồn tại`);
    }

    const userWithoutPassword = { ...user } as Partial<typeof user>;
    delete userWithoutPassword.password;

    return {
      ...userWithoutPassword,
      roles: user.userRoles.map((ur) => ur.role.name),
    };
  }

  async create(dto: CreateUserDto) {
    const existingCode = await this.usersRepository.findByStudentCode(
      dto.studentCode,
    );
    if (existingCode) {
      throw new BadRequestException(
        `Mã số sinh viên/mã người dùng "${dto.studentCode}" đã tồn tại trên hệ thống`,
      );
    }

    const existingEmail = await this.usersRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new BadRequestException(
        `Email "${dto.email}" đã được đăng ký cho tài khoản khác`,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersRepository.create(
      {
        studentCode: dto.studentCode,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
      },
      dto.roleIds,
    );

    const userWithoutPassword = { ...user } as Partial<typeof user>;
    delete userWithoutPassword.password;

    return {
      ...userWithoutPassword,
      roles: user.userRoles.map((ur) => ur.role.name),
    };
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findById(id); // Throws NotFoundException if doesn't exist

    const updateData: {
      studentCode?: string;
      fullName?: string;
      email?: string;
      phone?: string;
      password?: string;
    } = {};
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;

    if (dto.studentCode && dto.studentCode !== user.studentCode) {
      const existingCode = await this.usersRepository.findByStudentCode(
        dto.studentCode,
      );
      if (existingCode) {
        throw new BadRequestException(
          `Mã số sinh viên/mã người dùng "${dto.studentCode}" đã tồn tại`,
        );
      }
      updateData.studentCode = dto.studentCode;
    }

    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.usersRepository.findByEmail(dto.email);
      if (existingEmail) {
        throw new BadRequestException(
          `Email "${dto.email}" đã được đăng ký cho tài khoản khác`,
        );
      }
      updateData.email = dto.email;
    }

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.usersRepository.update(
      id,
      updateData,
      dto.roleIds,
    );

    const userWithoutPassword = { ...updatedUser } as Partial<
      typeof updatedUser
    >;
    delete userWithoutPassword.password;

    return {
      ...userWithoutPassword,
      roles: updatedUser.userRoles.map((ur) => ur.role.name),
    };
  }

  async delete(id: number) {
    await this.findById(id); // Throws NotFoundException if doesn't exist
    await this.usersRepository.delete(id);
    return {
      success: true,
      message: 'Xoá người dùng thành công',
    };
  }
}
