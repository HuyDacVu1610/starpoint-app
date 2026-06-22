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
exports.SemestersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const semesters_repository_1 = require("../repositories/semesters.repository");
let SemestersService = class SemestersService {
    semestersRepository;
    constructor(semestersRepository) {
        this.semestersRepository = semestersRepository;
    }
    async findAll(query) {
        return this.semestersRepository.findAll(query);
    }
    async findById(id) {
        const semester = await this.semestersRepository.findById(id);
        if (!semester) {
            throw new common_1.NotFoundException('Học kỳ không tồn tại');
        }
        return semester;
    }
    async create(dto) {
        if (dto.startDate >= dto.endDate) {
            throw new common_1.BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
        }
        const existing = await this.semestersRepository.findByYearAndTerm(dto.year, dto.term);
        if (existing) {
            throw new common_1.BadRequestException(`Học kỳ cho năm học ${dto.year} kỳ ${dto.term} đã tồn tại`);
        }
        return this.semestersRepository.create(dto);
    }
    async update(id, dto) {
        const current = await this.findById(id);
        const finalStartDate = dto.startDate !== undefined ? dto.startDate : current.startDate;
        const finalEndDate = dto.endDate !== undefined ? dto.endDate : current.endDate;
        if (finalStartDate >= finalEndDate) {
            throw new common_1.BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
        }
        const finalYear = dto.year !== undefined ? dto.year : current.year;
        const finalTerm = dto.term !== undefined ? dto.term : current.term;
        if (finalYear !== current.year || finalTerm !== current.term) {
            const existing = await this.semestersRepository.findByYearAndTerm(finalYear, finalTerm);
            if (existing && existing.id !== id) {
                throw new common_1.BadRequestException(`Học kỳ cho năm học ${finalYear} kỳ ${finalTerm} đã tồn tại`);
            }
        }
        return this.semestersRepository.update(id, dto);
    }
    async delete(id) {
        await this.findById(id);
        try {
            return await this.semestersRepository.delete(id);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2003') {
                throw new common_1.BadRequestException('Không thể xoá học kỳ này vì đang có cuộc thi hoặc thành tích liên kết');
            }
            throw error;
        }
    }
};
exports.SemestersService = SemestersService;
exports.SemestersService = SemestersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [semesters_repository_1.SemestersRepository])
], SemestersService);
//# sourceMappingURL=semesters.service.js.map