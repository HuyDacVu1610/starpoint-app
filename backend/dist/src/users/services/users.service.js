"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const users_repository_1 = require("../repositories/users.repository");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async findAll(query) {
        const { total, data } = await this.usersRepository.findAll(query);
        const formattedUsers = data.map((user) => {
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;
            delete userWithoutPassword.userRoles;
            return {
                ...userWithoutPassword,
                roles: user.userRoles.map((ur) => ur.role.name),
            };
        });
        return {
            data: formattedUsers,
            meta: {
                page: query.page || 1,
                limit: query.limit || 10,
                total,
            },
        };
    }
    async findById(id) {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(`Người dùng với ID ${id} không tồn tại`);
        }
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        delete userWithoutPassword.userRoles;
        return {
            ...userWithoutPassword,
            roles: user.userRoles.map((ur) => ur.role.name),
        };
    }
    async create(dto) {
        const existingCode = await this.usersRepository.findByStudentCode(dto.studentCode);
        if (existingCode) {
            throw new common_1.BadRequestException(`Mã số sinh viên/mã người dùng "${dto.studentCode}" đã tồn tại trên hệ thống`);
        }
        const existingEmail = await this.usersRepository.findByEmail(dto.email);
        if (existingEmail) {
            throw new common_1.BadRequestException(`Email "${dto.email}" đã được đăng ký cho tài khoản khác`);
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.usersRepository.create({
            studentCode: dto.studentCode,
            fullName: dto.fullName,
            email: dto.email,
            phone: dto.phone,
            password: hashedPassword,
        }, dto.roleIds);
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        delete userWithoutPassword.userRoles;
        return {
            ...userWithoutPassword,
            roles: user.userRoles.map((ur) => ur.role.name),
        };
    }
    async update(id, dto) {
        const user = await this.findById(id);
        const updateData = {};
        if (dto.fullName !== undefined)
            updateData.fullName = dto.fullName;
        if (dto.phone !== undefined)
            updateData.phone = dto.phone;
        if (dto.studentCode && dto.studentCode !== user.studentCode) {
            const existingCode = await this.usersRepository.findByStudentCode(dto.studentCode);
            if (existingCode) {
                throw new common_1.BadRequestException(`Mã số sinh viên/mã người dùng "${dto.studentCode}" đã tồn tại`);
            }
            updateData.studentCode = dto.studentCode;
        }
        if (dto.email && dto.email !== user.email) {
            const existingEmail = await this.usersRepository.findByEmail(dto.email);
            if (existingEmail) {
                throw new common_1.BadRequestException(`Email "${dto.email}" đã được đăng ký cho tài khoản khác`);
            }
            updateData.email = dto.email;
        }
        if (dto.password) {
            updateData.password = await bcrypt.hash(dto.password, 10);
        }
        const updatedUser = await this.usersRepository.update(id, updateData, dto.roleIds);
        const userWithoutPassword = { ...updatedUser };
        delete userWithoutPassword.password;
        delete userWithoutPassword.userRoles;
        return {
            ...userWithoutPassword,
            roles: updatedUser.userRoles.map((ur) => ur.role.name),
        };
    }
    async softDelete(id) {
        await this.findById(id);
        await this.usersRepository.softDelete(id);
        return {
            success: true,
            message: 'Xoá người dùng thành công',
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map