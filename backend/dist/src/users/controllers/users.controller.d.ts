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
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                };
            } & {
                userId: number;
                roleId: number;
            })[] | undefined;
            id?: number | undefined;
            studentCode?: string | undefined;
            fullName?: string | undefined;
            email?: string | undefined;
            phone?: string | null | undefined;
            password?: string | undefined;
            avatarUrl?: string | null | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
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
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            userId: number;
            roleId: number;
        })[] | undefined;
        id?: number | undefined;
        studentCode?: string | undefined;
        fullName?: string | undefined;
        email?: string | undefined;
        phone?: string | null | undefined;
        password?: string | undefined;
        avatarUrl?: string | null | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        deletedAt?: Date | null | undefined;
    }>;
    create(dto: CreateUserDto): Promise<{
        roles: string[];
        userRoles?: ({
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
        })[] | undefined;
        id?: number | undefined;
        studentCode?: string | undefined;
        fullName?: string | undefined;
        email?: string | undefined;
        phone?: string | null | undefined;
        password?: string | undefined;
        avatarUrl?: string | null | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        deletedAt?: Date | null | undefined;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        roles: string[];
        userRoles?: ({
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
        })[] | undefined;
        id?: number | undefined;
        studentCode?: string | undefined;
        fullName?: string | undefined;
        email?: string | undefined;
        phone?: string | null | undefined;
        password?: string | undefined;
        avatarUrl?: string | null | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        deletedAt?: Date | null | undefined;
    }>;
    delete(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
