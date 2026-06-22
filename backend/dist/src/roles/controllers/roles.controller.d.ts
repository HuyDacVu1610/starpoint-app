import { Request } from 'express';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
interface UserPayload {
    id: number;
    studentCode: string;
    email: string;
    roles: string[];
    permissions: string[];
}
interface AuthenticatedRequest extends Request {
    user: UserPayload;
}
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
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
    create(req: AuthenticatedRequest, dto: CreateRoleDto): Promise<{
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
    update(req: AuthenticatedRequest, id: number, dto: UpdateRoleDto): Promise<{
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
    private checkAdminRole;
}
export {};
