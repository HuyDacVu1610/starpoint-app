import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { SemestersRepository } from '../repositories/semesters.repository';
import { CreateSemesterDto } from '../dto/create-semester.dto';
import { UpdateSemesterDto } from '../dto/update-semester.dto';
import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';

@Injectable()
export class SemestersService {
  constructor(
    private readonly semestersRepository: SemestersRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const cacheKey = `semesters:all:${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.semestersRepository.findAll(query);
    await this.cacheManager.set(cacheKey, result, 1800 * 1000); // 30 minutes in ms
    return result;
  }

  async findById(id: number) {
    const semester = await this.semestersRepository.findById(id);
    if (!semester) {
      throw new NotFoundException('Học kỳ không tồn tại');
    }
    return semester;
  }

  async findCurrentActiveSemester() {
    const semester = await this.semestersRepository.findActiveSemester();
    if (!semester) {
      throw new NotFoundException('Không tìm thấy học kỳ hiện tại');
    }
    return semester;
  }

  async create(dto: CreateSemesterDto) {
    if (dto.startDate >= dto.endDate) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }

    const existing = await this.semestersRepository.findByYearAndTerm(
      dto.year,
      dto.term,
    );
    if (existing) {
      throw new BadRequestException(
        `Học kỳ cho năm học ${dto.year} kỳ ${dto.term} đã tồn tại`,
      );
    }

    const result = await this.semestersRepository.create(dto);
    await this.cacheManager.clear(); // Clear cache to invalidate list
    return result;
  }

  async update(id: number, dto: UpdateSemesterDto) {
    const current = await this.findById(id);

    const finalStartDate =
      dto.startDate !== undefined ? dto.startDate : current.startDate;
    const finalEndDate =
      dto.endDate !== undefined ? dto.endDate : current.endDate;

    if (finalStartDate >= finalEndDate) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }

    const finalYear = dto.year !== undefined ? dto.year : current.year;
    const finalTerm = dto.term !== undefined ? dto.term : current.term;

    if (finalYear !== current.year || finalTerm !== current.term) {
      const existing = await this.semestersRepository.findByYearAndTerm(
        finalYear,
        finalTerm,
      );
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Học kỳ cho năm học ${finalYear} kỳ ${finalTerm} đã tồn tại`,
        );
      }
    }

    const result = await this.semestersRepository.update(id, dto);
    await this.cacheManager.clear(); // Clear cache to invalidate list
    return result;
  }

  async delete(id: number) {
    await this.findById(id);

    try {
      const result = await this.semestersRepository.delete(id);
      await this.cacheManager.clear(); // Clear cache to invalidate list
      return result;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Không thể xoá học kỳ này vì đang có cuộc thi hoặc thành tích liên kết',
        );
      }
      throw error;
    }
  }
}

