import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { hash } from '../../shared/common/utils/crypto.util';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as xlsx from 'xlsx';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
  ) {}

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

    const hashedPassword = await hash(dto.password);

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
      updateData.password = await hash(dto.password);
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

  async importUsers(fileBuffer: Buffer) {
    let workbook: xlsx.WorkBook;
    try {
      workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    } catch (e) {
      throw new BadRequestException('File Excel không hợp lệ hoặc bị hỏng');
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestException('File Excel không chứa bất kỳ sheet nào');
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<any>(worksheet);

    if (rows.length === 0) {
      throw new BadRequestException('File Excel trống');
    }

    // 3. Find Column Headers
    const firstRow = rows[0];
    const keys = Object.keys(firstRow);

    let studentCodeKey = '';
    let fullNameKey = '';
    let emailKey = '';
    let phoneKey = '';
    let roleNameKey = '';

    for (const key of keys) {
      const normalized = key
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]/g, '');

      if (
        normalized.includes('studentcode') ||
        normalized.includes('mssv') ||
        normalized.includes('masinhvien') ||
        normalized.includes('manguoidung') ||
        normalized.includes('code') ||
        normalized === 'sv' ||
        normalized === 'masv'
      ) {
        studentCodeKey = key;
      } else if (
        normalized.includes('fullname') ||
        normalized.includes('hoten') ||
        normalized.includes('hovaten') ||
        normalized.includes('name') ||
        normalized === 'ten'
      ) {
        fullNameKey = key;
      } else if (
        normalized.includes('email') ||
        normalized.includes('gmail') ||
        normalized === 'mail'
      ) {
        emailKey = key;
      } else if (
        normalized.includes('sodienthoai') ||
        normalized.includes('sdt') ||
        normalized.includes('phone') ||
        normalized.includes('dienthoai')
      ) {
        phoneKey = key;
      } else if (
        normalized.includes('vaitro') ||
        normalized.includes('role') ||
        normalized.includes('quyen')
      ) {
        roleNameKey = key;
      }
    }

    const missingHeaders: string[] = [];
    if (!studentCodeKey) missingHeaders.push('Mã sinh viên/Mã người dùng (MSSV)');
    if (!fullNameKey) missingHeaders.push('Họ và tên');
    if (!emailKey) missingHeaders.push('Email');
    if (!roleNameKey) missingHeaders.push('Vai trò (Role)');

    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `Không tìm thấy tiêu đề cột tương ứng trong file Excel: ${missingHeaders.join(', ')}`,
      );
    }

    const errors: string[] = [];
    const validRows: any[] = [];
    const seenStudentCodes = new Set<string>();
    const seenEmails = new Set<string>();

    // 1. Normalize and validate rows
    rows.forEach((row, index) => {
      const rowNum = index + 2;
      const studentCode = row[studentCodeKey] ? String(row[studentCodeKey]).trim() : undefined;
      const fullName = row[fullNameKey] ? String(row[fullNameKey]).trim() : undefined;
      const email = row[emailKey] ? String(row[emailKey]).trim() : undefined;
      const phone = phoneKey && row[phoneKey] ? String(row[phoneKey]).trim() : null;
      let roleName = roleNameKey && row[roleNameKey] ? String(row[roleNameKey]).trim() : undefined;
      if (roleName) {
        const normalizedRole = roleName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]/g, '');

        if (
          normalizedRole.includes('sinhvien') ||
          normalizedRole === 'sv' ||
          normalizedRole === 'student'
        ) {
          roleName = 'STUDENT';
        } else if (
          normalizedRole.includes('giaovu') ||
          normalizedRole.includes('nhanvien') ||
          normalizedRole === 'staff'
        ) {
          roleName = 'STAFF';
        } else if (
          normalizedRole.includes('quantri') ||
          normalizedRole === 'admin'
        ) {
          roleName = 'ADMIN';
        }
      }

      const rowErrors: string[] = [];

      if (!studentCode) {
        rowErrors.push(`Dòng ${rowNum}: Thiếu mã số sinh viên/người dùng`);
      }
      if (!fullName) {
        rowErrors.push(`Dòng ${rowNum}: Thiếu họ và tên`);
      }
      if (!email) {
        rowErrors.push(`Dòng ${rowNum}: Thiếu email`);
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          rowErrors.push(`Dòng ${rowNum}: Email "${email}" không đúng định dạng`);
        }
      }
      if (!roleName) {
        rowErrors.push(`Dòng ${rowNum}: Thiếu vai trò phân quyền`);
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
        return;
      }

      const studentCodeUpper = studentCode!.toUpperCase();
      const emailLower = email!.toLowerCase();

      // Check duplicate within the file
      if (seenStudentCodes.has(studentCodeUpper)) {
        errors.push(`Dòng ${rowNum}: Mã sinh viên "${studentCode}" bị trùng lặp trong file`);
        return;
      }
      if (seenEmails.has(emailLower)) {
        errors.push(`Dòng ${rowNum}: Email "${email}" bị trùng lặp trong file`);
        return;
      }

      seenStudentCodes.add(studentCodeUpper);
      seenEmails.add(emailLower);

      validRows.push({
        rowNum,
        studentCode,
        fullName,
        email,
        phone: phone || null,
        roleName: roleName!.toUpperCase(),
      });
    });

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    // 2. Query Roles and Users for mapping/validation
    const [dbRoles, dbUsers] = await Promise.all([
      this.prisma.role.findMany(),
      this.prisma.user.findMany({
        include: {
          userRoles: true,
        },
      }),
    ]);

    const roleMap = new Map(dbRoles.map((r) => [r.name.toUpperCase(), r.id]));
    const dbUserMap = new Map(dbUsers.map((u) => [u.studentCode.toUpperCase(), u]));
    const dbEmailMap = new Map(dbUsers.map((u) => [u.email.toLowerCase(), u]));

    // Validate roles
    validRows.forEach((row) => {
      const roleId = roleMap.get(row.roleName);
      if (!roleId) {
        errors.push(`Dòng ${row.rowNum}: Vai trò "${row.roleName}" không tồn tại trên hệ thống`);
      }
    });

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    // 3. Perform batch upsert inside a transaction
    let createdCount = 0;
    let updatedCount = 0;
    const passwordHash = await hash('password123');

    await this.prisma.$transaction(async (tx) => {
      for (const row of validRows) {
        const studentCodeUpper = row.studentCode.toUpperCase();
        const emailLower = row.email.toLowerCase();

        const existingUser = dbUserMap.get(studentCodeUpper);

        if (existingUser) {
          // If user exists, update details
          const emailUser = dbEmailMap.get(emailLower);
          if (emailUser && emailUser.id !== existingUser.id) {
            throw new BadRequestException(
              `Dòng ${row.rowNum}: Email "${row.email}" đã được đăng ký cho tài khoản khác (Mã: ${emailUser.studentCode})`,
            );
          }

          const updateData: any = {
            fullName: row.fullName,
            email: row.email,
          };
          if (row.phone !== undefined) {
            updateData.phone = row.phone;
          }

          await tx.user.update({
            where: { id: existingUser.id },
            data: updateData,
          });
          updatedCount++;
        } else {
          // If user is new, verify that email is not taken in the database
          const emailUser = dbEmailMap.get(emailLower);
          if (emailUser) {
            throw new BadRequestException(
              `Dòng ${row.rowNum}: Email "${row.email}" đã được đăng ký cho tài khoản khác (Mã: ${emailUser.studentCode})`,
            );
          }

          const roleId = roleMap.get(row.roleName) || roleMap.get('STUDENT');
          await tx.user.create({
            data: {
              studentCode: row.studentCode,
              fullName: row.fullName,
              email: row.email,
              phone: row.phone,
              password: passwordHash,
              userRoles: {
                create: {
                  roleId: roleId!,
                },
              },
            },
          });
          createdCount++;
        }
      }
    });

    return {
      success: true,
      message: `Đã nhập thành công danh sách người dùng: Tạo mới ${createdCount} tài khoản và cập nhật ${updatedCount} tài khoản.`,
    };
  }
}
