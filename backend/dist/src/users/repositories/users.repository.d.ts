import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryUserDto } from '../dto/query-user.dto';
export declare class UsersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryUserDto): Promise<{
        total: number;
        data: ({
            userRoles: ({
                role: {
                    id: number;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                roleId: number;
                userId: number;
            })[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            studentCode: string;
            email: string;
            fullName: string;
            phone: string | null;
            password: string;
            avatarUrl: string | null;
            deletedAt: Date | null;
        })[];
    }>;
    findById(id: number): Promise<({
        userRoles: ({
            role: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            roleId: number;
            userId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studentCode: string;
        email: string;
        fullName: string;
        phone: string | null;
        password: string;
        avatarUrl: string | null;
        deletedAt: Date | null;
    }) | null>;
    findByStudentCode(studentCode: string): Promise<({
        userRoles: ({
            role: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            roleId: number;
            userId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studentCode: string;
        email: string;
        fullName: string;
        phone: string | null;
        password: string;
        avatarUrl: string | null;
        deletedAt: Date | null;
    }) | null>;
    findByEmail(email: string): Promise<({
        userRoles: ({
            role: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            roleId: number;
            userId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studentCode: string;
        email: string;
        fullName: string;
        phone: string | null;
        password: string;
        avatarUrl: string | null;
        deletedAt: Date | null;
    }) | null>;
    create(data: Prisma.UserCreateInput, roleIds: number[]): Promise<{
        userRoles: ({
            role: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            roleId: number;
            userId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studentCode: string;
        email: string;
        fullName: string;
        phone: string | null;
        password: string;
        avatarUrl: string | null;
        deletedAt: Date | null;
    }>;
    update(id: number, data: Prisma.UserUpdateInput, roleIds?: number[]): Promise<{
        userRoles: ({
            role: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            roleId: number;
            userId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studentCode: string;
        email: string;
        fullName: string;
        phone: string | null;
        password: string;
        avatarUrl: string | null;
        deletedAt: Date | null;
    }>;
    softDelete(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studentCode: string;
        email: string;
        fullName: string;
        phone: string | null;
        password: string;
        avatarUrl: string | null;
        deletedAt: Date | null;
    }>;
}
