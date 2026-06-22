import { RolesRepository } from '../repositories/roles.repository';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
export declare class RolesService {
    private readonly rolesRepository;
    constructor(rolesRepository: RolesRepository);
    findAll(): Promise<{
        id: number;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findById(id: number): Promise<{
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
    create(dto: CreateRoleDto): Promise<{
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
    update(id: number, dto: UpdateRoleDto): Promise<{
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
