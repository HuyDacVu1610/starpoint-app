import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CompetitionsRepository } from '../repositories/competitions.repository';
import { SemestersService } from '../../semesters/services/semesters.service';
import { CreateCompetitionDto } from '../dto/create-competition.dto';
import { UpdateCompetitionDto } from '../dto/update-competition.dto';
import { QueryCompetitionDto } from '../dto/query-competition.dto';

@Injectable()
export class CompetitionsService {
  constructor(
    private readonly competitionsRepository: CompetitionsRepository,
    private readonly semestersService: SemestersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll(query: QueryCompetitionDto) {
    const cacheKey = `competitions:all:${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.competitionsRepository.findAll(query);
    await this.cacheManager.set(cacheKey, result, 600 * 1000); // 10 minutes in ms
    return result;
  }

  async findById(id: number) {
    const competition = await this.competitionsRepository.findById(id);
    if (!competition) {
      throw new NotFoundException('Cuộc thi không tồn tại');
    }
    return competition;
  }

  async create(dto: CreateCompetitionDto) {
    // Validate that the semester exists
    await this.semestersService.findById(dto.semesterId);

    const result = await this.competitionsRepository.create(dto);
    await this.cacheManager.clear(); // Clear cache to invalidate list
    return result;
  }

  async update(id: number, dto: UpdateCompetitionDto) {
    await this.findById(id);

    if (dto.semesterId !== undefined) {
      // Validate that the semester exists
      await this.semestersService.findById(dto.semesterId);
    }

    const result = await this.competitionsRepository.update(id, dto);
    await this.cacheManager.clear(); // Clear cache to invalidate list
    return result;
  }

  async delete(id: number) {
    await this.findById(id);
    const result = await this.competitionsRepository.delete(id);
    await this.cacheManager.clear(); // Clear cache to invalidate list
    return result;
  }
}

