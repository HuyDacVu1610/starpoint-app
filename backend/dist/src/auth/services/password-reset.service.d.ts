import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from './mail.service';
import { ForgotPasswordRequestDto } from '../dto/forgot-password-request.dto';
import { VerifyResetCodeDto } from '../dto/verify-reset-code.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
export declare class PasswordResetService {
    private readonly prisma;
    private readonly mailService;
    constructor(prisma: PrismaService, mailService: MailService);
    requestReset(dto: ForgotPasswordRequestDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyCode(dto: VerifyResetCodeDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
