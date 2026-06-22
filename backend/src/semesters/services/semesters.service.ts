import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SemestersRepository } from '../repositories/semesters.repository';
import { CreateSemesterDto } from '../dto/create-semester.dto';
import { UpdateSemesterDto } from '../dto/update-semester.dto';
import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';

@Injectable()
export class SemestersService {
  constructor(private readonly semestersRepository: SemestersRepository) {}

  async findAll(query: PaginationQueryDto) {
    return this.semestersRepository.findAll(query);
  }

  async findById(id: number) {
    const semester = await this.semestersRepository.findById(id);
    if (!semester) {
      throw new NotFoundException('Học kỳ không tồn tại');
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

    return this.semestersRepository.create(dto);
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

    return this.semestersRepository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);

    try {
      return await this.semestersRepository.delete(id);
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
