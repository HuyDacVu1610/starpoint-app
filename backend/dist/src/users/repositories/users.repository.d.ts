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
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                };
            } & {
                userId: number;
                roleId: number;
            })[];
        } & {
            id: number;
            studentCode: string;
            fullName: string;
            email: string;
            phone: string | null;
            password: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        })[];
    }>;
    findById(id: number): Promise<({
        userRoles: ({
            role: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            userId: number;
            roleId: number;
        })[];
    } & {
        id: number;
        studentCode: string;
        fullName: string;
        email: string;
        phone: string | null;
        password: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }) | null>;
    findByStudentCode(studentCode: string): Promise<({
        userRoles: ({
            role: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            userId: number;
            roleId: number;
        })[];
    } & {
        id: number;
        studentCode: string;
        fullName: string;
        email: string;
        phone: string | null;
        password: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }) | null>;
    findByEmail(email: string): Promise<({
        userRoles: ({
            role: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            userId: number;
            roleId: number;
        })[];
    } & {
        id: number;
        studentCode: string;
        fullName: string;
        email: string;
        phone: string | null;
        password: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }) | null>;
    create(data: Prisma.UserCreateInput, roleIds: number[]): Promise<{
        userRoles: ({
            role: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            userId: number;
            roleId: number;
        })[];
    } & {
        id: number;
        studentCode: string;
        fullName: string;
        email: string;
        phone: string | null;
        password: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    update(id: number, data: Prisma.UserUpdateInput, roleIds?: number[]): Promise<{
        userRoles: ({
            role: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            userId: number;
            roleId: number;
        })[];
    } & {
        id: number;
        studentCode: string;
        fullName: string;
        email: string;
        phone: string | null;
        password: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        studentCode: string;
        fullName: string;
        email: string;
        phone: string | null;
        password: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}
