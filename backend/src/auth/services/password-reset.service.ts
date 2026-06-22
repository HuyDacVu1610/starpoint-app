import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from './mail.service';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordRequestDto } from '../dto/forgot-password-request.dto';
import { VerifyResetCodeDto } from '../dto/verify-reset-code.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async requestReset(dto: ForgotPasswordRequestDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        studentCode: dto.studentCode,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Mã số sinh viên không tồn tại trên hệ thống',
      );
    }

    if (user.email.toLowerCase() !== dto.email.toLowerCase()) {
      throw new BadRequestException('Mã số sinh viên và email không khớp');
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    // Delete previous codes for this user to avoid duplication/spam
    await this.prisma.passwordResetCode.deleteMany({
      where: { userId: user.id },
    });

    // Save reset code
    await this.prisma.passwordResetCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    // Send email
    await this.mailService.sendResetCode(user.email, code);

    return {
      success: true,
      message: 'Mã xác nhận đã được gửi tới email của bạn.',
    };
  }

  async verifyCode(dto: VerifyResetCodeDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        studentCode: dto.studentCode,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('Mã số sinh viên không tồn tại');
    }

    const resetCode = await this.prisma.passwordResetCode.findFirst({
      where: {
        userId: user.id,
        code: dto.code,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetCode) {
      throw new BadRequestException('Mã xác nhận không hợp lệ hoặc đã hết hạn');
    }

    return {
      success: true,
      message: 'Mã xác nhận hợp lệ.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        studentCode: dto.studentCode,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('Mã số sinh viên không tồn tại');
    }

    const resetCode = await this.prisma.passwordResetCode.findFirst({
      where: {
        userId: user.id,
        code: dto.code,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetCode) {
      throw new BadRequestException('Mã xác nhận không hợp lệ hoặc đã hết hạn');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Update user password and invalidate the code
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetCode.update({
        where: { id: resetCode.id },
        data: { isUsed: true },
      }),
    ]);

    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công.',
    };
  }
}
