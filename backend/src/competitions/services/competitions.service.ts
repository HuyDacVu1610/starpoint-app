import { Injectable, NotFoundException } from '@nestjs/common';
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
  ) {}

  async findAll(query: QueryCompetitionDto) {
    return this.competitionsRepository.findAll(query);
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

    return this.competitionsRepository.create(dto);
  }

  async update(id: number, dto: UpdateCompetitionDto) {
    await this.findById(id);

    if (dto.semesterId !== undefined) {
      // Validate that the semester exists
      await this.semestersService.findById(dto.semesterId);
    }

    return this.competitionsRepository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    return this.competitionsRepository.delete(id);
  }
}
