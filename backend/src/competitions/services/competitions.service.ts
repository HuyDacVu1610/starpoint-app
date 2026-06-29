import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CompetitionsRepository } from '../repositories/competitions.repository';
import { SemestersService } from '../../semesters/services/semesters.service';
import { CreateCompetitionDto } from '../dto/create-competition.dto';
import { UpdateCompetitionDto } from '../dto/update-competition.dto';
import { QueryCompetitionDto } from '../dto/query-competition.dto';

function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

@Injectable()
export class CompetitionsService {
  constructor(
    private readonly competitionsRepository: CompetitionsRepository,
    private readonly semestersService: SemestersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private enrichCompetition(competition: any) {
    if (!competition) return null;
    const eventDate = new Date(competition.eventDate);
    const endDate = new Date(competition.endDate);
    const status = this.getCompetitionStatus(eventDate, endDate);
    return {
      ...competition,
      status,
    };
  }

  private getCompetitionStatus(eventDate: Date, endDate: Date): 'UPCOMING' | 'ONGOING' | 'ENDED' {
    const now = new Date();
    if (now < eventDate) return 'UPCOMING';
    if (now > endDate) return 'ENDED';
    return 'ONGOING';
  }

  async findAll(query: QueryCompetitionDto) {
    const cacheKey = `competitions:all:${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.competitionsRepository.findAll(query);
    const enrichedData = result.data.map((c) => this.enrichCompetition(c));
    const finalResult = {
      total: result.total,
      data: enrichedData,
    };
    await this.cacheManager.set(cacheKey, finalResult, 600 * 1000); // 10 minutes in ms
    return finalResult;
  }

  async findById(id: number) {
    const competition = await this.competitionsRepository.findById(id);
    if (!competition) {
      throw new NotFoundException('Cuộc thi không tồn tại');
    }
    return this.enrichCompetition(competition);
  }

  async create(dto: CreateCompetitionDto) {
    // Validate that the semester exists
    const semester = await this.semestersService.findById(dto.semesterId);

    // Validate that the semester is the active semester
    const activeSemester = await this.semestersService.findCurrentActiveSemester();
    if (!activeSemester || semester.id !== activeSemester.id) {
      throw new BadRequestException('Chỉ được phép tạo cuộc thi cho học kỳ hiện tại');
    }

    // Validate eventDate <= endDate
    if (dto.endDate < dto.eventDate) {
      throw new BadRequestException('Ngày kết thúc cuộc thi không được nhỏ hơn ngày tổ chức');
    }

    // Validate that eventDate falls within the semester's range
    if (dto.eventDate < semester.startDate || dto.eventDate > semester.endDate) {
      throw new BadRequestException(
        `Ngày tổ chức cuộc thi phải nằm trong khoảng thời gian của học kỳ (${formatDate(semester.startDate)} - ${formatDate(semester.endDate)})`,
      );
    }

    // Validate that endDate falls within the semester's range
    if (dto.endDate < semester.startDate || dto.endDate > semester.endDate) {
      throw new BadRequestException(
        `Ngày kết thúc cuộc thi phải nằm trong khoảng thời gian của học kỳ (${formatDate(semester.startDate)} - ${formatDate(semester.endDate)})`,
      );
    }

    const result = await this.competitionsRepository.create(dto);
    await this.cacheManager.clear(); // Clear cache to invalidate list
    return this.enrichCompetition(result);
  }

  async update(id: number, dto: UpdateCompetitionDto) {
    const existing = await this.findById(id);

    const semesterId = dto.semesterId !== undefined ? dto.semesterId : existing.semesterId;
    const eventDate = dto.eventDate !== undefined ? dto.eventDate : existing.eventDate;
    const endDate = dto.endDate !== undefined ? dto.endDate : existing.endDate;

    // Validate eventDate <= endDate
    if (endDate < eventDate) {
      throw new BadRequestException('Ngày kết thúc cuộc thi không được nhỏ hơn ngày tổ chức');
    }

    if (dto.semesterId !== undefined || dto.eventDate !== undefined || dto.endDate !== undefined) {
      const semester = await this.semestersService.findById(semesterId);
      if (eventDate < semester.startDate || eventDate > semester.endDate) {
        throw new BadRequestException(
          `Ngày tổ chức cuộc thi phải nằm trong khoảng thời gian của học kỳ (${formatDate(semester.startDate)} - ${formatDate(semester.endDate)})`,
        );
      }
      if (endDate < semester.startDate || endDate > semester.endDate) {
        throw new BadRequestException(
          `Ngày kết thúc cuộc thi phải nằm trong khoảng thời gian của học kỳ (${formatDate(semester.startDate)} - ${formatDate(semester.endDate)})`,
        );
      }
    }

    const result = await this.competitionsRepository.update(id, dto);
    await this.cacheManager.clear(); // Clear cache to invalidate list
    return this.enrichCompetition(result);
  }

  async delete(id: number) {
    await this.findById(id);
    const result = await this.competitionsRepository.delete(id);
    await this.cacheManager.clear(); // Clear cache to invalidate list
    return result;
  }
}

