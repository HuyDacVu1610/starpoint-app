import { IsOptional, IsInt, IsBoolean, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Grade } from '@prisma/client';
import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';

export class QueryCandidateDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  semesterId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @IsOptional()
  @Transform(({ value }): boolean | undefined => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isEligible?: boolean;

  @IsOptional()
  @IsEnum(Grade)
  scholarshipTier?: Grade;
}
