import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Body,
  Request as NestRequest,
} from '@nestjs/common';
import { ScholarshipsService } from '../services/scholarships.service';
import { QueryCandidateDto } from '../dto/query-candidate.dto';
import { EvaluateScholarshipDto } from '../dto/evaluate-scholarship.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../shared/common/decorators/permissions.decorator';
import { Request } from 'express';

interface UserPayload {
  id: number;
  studentCode: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

@Controller('scholarships')
@UseGuards(JwtAuthGuard)
export class ScholarshipsController {
  constructor(private readonly scholarshipsService: ScholarshipsService) {}

  @Get('candidates')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('VIEW_SCHOLARSHIP')
  async findAll(@Query() query: QueryCandidateDto) {
    return this.scholarshipsService.findAll(query);
  }

  @Get('my')
  async findMy(
    @Query() query: QueryCandidateDto,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    query.userId = req.user.id;
    query.search = undefined; // Do not allow students to search other records
    return this.scholarshipsService.findAll(query);
  }

  @Post('evaluate')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('MANAGE_SCHOLARSHIP')
  async evaluate(@Body() dto: EvaluateScholarshipDto) {
    return this.scholarshipsService.evaluateScholarships(dto.semesterId);
  }
}
