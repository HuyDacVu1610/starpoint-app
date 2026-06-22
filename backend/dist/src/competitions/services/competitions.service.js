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
exports.CompetitionsService = void 0;
const common_1 = require("@nestjs/common");
const competitions_repository_1 = require("../repositories/competitions.repository");
const semesters_service_1 = require("../../semesters/services/semesters.service");
let CompetitionsService = class CompetitionsService {
    competitionsRepository;
    semestersService;
    constructor(competitionsRepository, semestersService) {
        this.competitionsRepository = competitionsRepository;
        this.semestersService = semestersService;
    }
    async findAll(query) {
        return this.competitionsRepository.findAll(query);
    }
    async findById(id) {
        const competition = await this.competitionsRepository.findById(id);
        if (!competition) {
            throw new common_1.NotFoundException('Cuộc thi không tồn tại');
        }
        return competition;
    }
    async create(dto) {
        await this.semestersService.findById(dto.semesterId);
        return this.competitionsRepository.create(dto);
    }
    async update(id, dto) {
        await this.findById(id);
        if (dto.semesterId !== undefined) {
            await this.semestersService.findById(dto.semesterId);
        }
        return this.competitionsRepository.update(id, dto);
    }
    async delete(id) {
        await this.findById(id);
        return this.competitionsRepository.delete(id);
    }
};
exports.CompetitionsService = CompetitionsService;
exports.CompetitionsService = CompetitionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [competitions_repository_1.CompetitionsRepository,
        semesters_service_1.SemestersService])
], CompetitionsService);
//# sourceMappingURL=competitions.service.js.map