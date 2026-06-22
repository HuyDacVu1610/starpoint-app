import { IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';
import { CompetitionLevel } from '@starpointapp/shared';

export class QueryCompetitionDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID học kỳ phải là số nguyên' })
  @Min(1, { message: 'ID học kỳ phải lớn hơn 0' })
  semesterId?: number;

  @IsOptional()
  @IsEnum(CompetitionLevel, { message: 'Cấp cuộc thi không hợp lệ' })
  level?: CompetitionLevel;
}
