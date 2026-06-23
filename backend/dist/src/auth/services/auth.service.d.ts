import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly config;
    private activeRefreshTokens;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService);
    login(dto: LoginDto): Promise<{
        user: {
            roles: string[];
            permissions: string[];
            userRoles?: ({
                role: {
                    rolePermissions: ({
                        permission: {
                            id: number;
                            createdAt: Date;
                            updatedAt: Date;
                            name: string;
                            description: string | null;
                        };
                    } & {
                        roleId: number;
                        permissionId: number;
                    })[];
                } & {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                };
            } & {
                userId: number;
                roleId: number;
            })[] | undefined;
            studentCode?: string | undefined;
            email?: string | undefined;
            id?: number | undefined;
            fullName?: string | undefined;
            phone?: string | null | undefined;
            password?: string | undefined;
            avatarUrl?: string | null | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: number): {
        success: boolean;
        message: string;
    };
    refreshTokens(userId: number, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getMe(userId: number): Promise<{
        user: {
            roles: string[];
            permissions: string[];
            userRoles?: ({
                role: {
                    rolePermissions: ({
                        permission: {
                            id: number;
                            createdAt: Date;
                            updatedAt: Date;
                            name: string;
                            description: string | null;
                        };
                    } & {
                        roleId: number;
                        permissionId: number;
                    })[];
                } & {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                };
            } & {
                userId: number;
                roleId: number;
            })[] | undefined;
            studentCode?: string | undefined;
            email?: string | undefined;
            id?: number | undefined;
            fullName?: string | undefined;
            phone?: string | null | undefined;
            password?: string | undefined;
            avatarUrl?: string | null | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
        };
    }>;
    changePassword(userId: number, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateTokens;
}
