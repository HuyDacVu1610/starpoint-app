"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const roles_repository_1 = require("../repositories/roles.repository");
let RolesService = class RolesService {
    rolesRepository;
    constructor(rolesRepository) {
        this.rolesRepository = rolesRepository;
    }
    async findAll() {
        return this.rolesRepository.findAll();
    }
    async findById(id) {
        const role = await this.rolesRepository.findById(id);
        if (!role) {
            throw new common_1.NotFoundException(`Vai trò với ID ${id} không tồn tại`);
        }
        return role;
    }
    async create(dto) {
        const existing = await this.rolesRepository.findByName(dto.name);
        if (existing) {
            throw new common_1.BadRequestException(`Vai trò với tên "${dto.name}" đã tồn tại`);
        }
        return this.rolesRepository.create(dto.name, dto.description, dto.permissionIds);
    }
    async update(id, dto) {
        const role = await this.findById(id);
        if (dto.name && dto.name !== role.name) {
            const existing = await this.rolesRepository.findByName(dto.name);
            if (existing) {
                throw new common_1.BadRequestException(`Vai trò với tên "${dto.name}" đã tồn tại`);
            }
        }
        return this.rolesRepository.update(id, dto);
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [roles_repository_1.RolesRepository])
], RolesService);
//# sourceMappingURL=roles.service.js.map