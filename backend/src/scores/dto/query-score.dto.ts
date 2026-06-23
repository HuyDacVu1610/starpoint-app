import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';

export class QueryScoreDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  semesterId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}
