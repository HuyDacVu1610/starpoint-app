import { IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';
import { AchievementCategory, AchievementStatus } from '@starpointapp/shared';

export class QueryAchievementDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID học kỳ phải là số nguyên' })
  @Min(1)
  semesterId?: number;

  @IsOptional()
  @IsEnum(AchievementCategory, { message: 'Danh mục không hợp lệ' })
  category?: AchievementCategory;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID sinh viên phải là số nguyên' })
  @Min(1)
  userId?: number;

  @IsOptional()
  @IsEnum(AchievementStatus, { message: 'Trạng thái không hợp lệ' })
  status?: AchievementStatus;
}
