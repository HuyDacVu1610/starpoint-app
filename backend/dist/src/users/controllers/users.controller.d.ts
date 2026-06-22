import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(query: QueryUserDto): Promise<{
        data: {
            roles: string[];
            userRoles?: ({
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
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    findById(id: number): Promise<{
        roles: string[];
        userRoles?: ({
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
    }>;
    create(dto: CreateUserDto): Promise<{
        roles: string[];
        userRoles?: ({
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
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        roles: string[];
        userRoles?: ({
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
    }>;
    softDelete(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
