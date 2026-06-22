import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { PasswordResetService } from '../services/password-reset.service';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ForgotPasswordRequestDto } from '../dto/forgot-password-request.dto';
import { VerifyResetCodeDto } from '../dto/verify-reset-code.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
interface UserPayload {
    id: number;
    studentCode: string;
    email: string;
    roles: string[];
    permissions: string[];
    refreshToken?: string;
}
interface AuthenticatedRequest extends Request {
    user: UserPayload;
}
export declare class AuthController {
    private readonly authService;
    private readonly passwordResetService;
    constructor(authService: AuthService, passwordResetService: PasswordResetService);
    login(dto: LoginDto): Promise<{
        user: {
            roles: string[];
            permissions: string[];
            userRoles?: ({
                role: {
                    rolePermissions: ({
                        permission: {
                            id: number;
                            name: string;
                            description: string | null;
                            createdAt: Date;
                            updatedAt: Date;
                        };
                    } & {
                        roleId: number;
                        permissionId: number;
                    })[];
                } & {
                    id: number;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                roleId: number;
                userId: number;
            })[] | undefined;
            id?: number | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            studentCode?: string | undefined;
            email?: string | undefined;
            fullName?: string | undefined;
            phone?: string | null | undefined;
            password?: string | undefined;
            avatarUrl?: string | null | undefined;
            deletedAt?: Date | null | undefined;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    logout(req: AuthenticatedRequest): {
        success: boolean;
        message: string;
    };
    refresh(req: AuthenticatedRequest): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getMe(req: AuthenticatedRequest): Promise<{
        user: {
            roles: string[];
            permissions: string[];
            userRoles?: ({
                role: {
                    rolePermissions: ({
                        permission: {
                            id: number;
                            name: string;
                            description: string | null;
                            createdAt: Date;
                            updatedAt: Date;
                        };
                    } & {
                        roleId: number;
                        permissionId: number;
                    })[];
                } & {
                    id: number;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                roleId: number;
                userId: number;
            })[] | undefined;
            id?: number | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            studentCode?: string | undefined;
            email?: string | undefined;
            fullName?: string | undefined;
            phone?: string | null | undefined;
            password?: string | undefined;
            avatarUrl?: string | null | undefined;
            deletedAt?: Date | null | undefined;
        };
    }>;
    changePassword(req: AuthenticatedRequest, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordRequestDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyResetCode(dto: VerifyResetCodeDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
