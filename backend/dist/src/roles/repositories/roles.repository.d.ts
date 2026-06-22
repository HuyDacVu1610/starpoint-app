import { PrismaService } from '../../prisma/prisma.service';
export declare class RolesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findById(id: number): Promise<({
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
    }) | null>;
    findByName(name: string): Promise<{
        id: number;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    create(name: string, description?: string, permissionIds?: number[]): Promise<{
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
    }>;
    update(id: number, data: {
        name?: string;
        description?: string;
        permissionIds?: number[];
    }): Promise<{
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
    }>;
}
