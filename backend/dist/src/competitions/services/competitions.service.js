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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitionsService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const competitions_repository_1 = require("../repositories/competitions.repository");
const semesters_service_1 = require("../../semesters/services/semesters.service");
function formatDate(date) {
    return date.toLocaleDateString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}
let CompetitionsService = class CompetitionsService {
    competitionsRepository;
    semestersService;
    cacheManager;
    constructor(competitionsRepository, semestersService, cacheManager) {
        this.competitionsRepository = competitionsRepository;
        this.semestersService = semestersService;
        this.cacheManager = cacheManager;
    }
    async findAll(query) {
        const cacheKey = `competitions:all:${JSON.stringify(query)}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.competitionsRepository.findAll(query);
        await this.cacheManager.set(cacheKey, result, 600 * 1000);
        return result;
    }
    async findById(id) {
        const competition = await this.competitionsRepository.findById(id);
        if (!competition) {
            throw new common_1.NotFoundException('Cuộc thi không tồn tại');
        }
        return competition;
    }
    async create(dto) {
        const semester = await this.semestersService.findById(dto.semesterId);
        if (dto.eventDate < semester.startDate || dto.eventDate > semester.endDate) {
            throw new common_1.BadRequestException(`Ngày tổ chức cuộc thi phải nằm trong khoảng thời gian của học kỳ (${formatDate(semester.startDate)} - ${formatDate(semester.endDate)})`);
        }
        const result = await this.competitionsRepository.create(dto);
        await this.cacheManager.clear();
        return result;
    }
    async update(id, dto) {
        const existing = await this.findById(id);
        const semesterId = dto.semesterId !== undefined ? dto.semesterId : existing.semesterId;
        const eventDate = dto.eventDate !== undefined ? dto.eventDate : existing.eventDate;
        if (dto.semesterId !== undefined || dto.eventDate !== undefined) {
            const semester = await this.semestersService.findById(semesterId);
            if (eventDate < semester.startDate || eventDate > semester.endDate) {
                throw new common_1.BadRequestException(`Ngày tổ chức cuộc thi phải nằm trong khoảng thời gian của học kỳ (${formatDate(semester.startDate)} - ${formatDate(semester.endDate)})`);
            }
        }
        const result = await this.competitionsRepository.update(id, dto);
        await this.cacheManager.clear();
        return result;
    }
    async delete(id) {
        await this.findById(id);
        const result = await this.competitionsRepository.delete(id);
        await this.cacheManager.clear();
        return result;
    }
};
exports.CompetitionsService = CompetitionsService;
exports.CompetitionsService = CompetitionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [competitions_repository_1.CompetitionsRepository,
        semesters_service_1.SemestersService, Object])
], CompetitionsService);
//# sourceMappingURL=competitions.service.js.map