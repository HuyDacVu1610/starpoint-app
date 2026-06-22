import { IsOptional, IsEnum, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import {
  AchievementCategory,
  AchievementRank,
  AchievementStatus,
} from '@starpointapp/shared';

export class UpdateAchievementDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID sinh viên phải là số nguyên' })
  @Min(1)
  userId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID cuộc thi phải là số nguyên' })
  @Min(1)
  competitionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID học kỳ phải là số nguyên' })
  @Min(1)
  semesterId?: number;

  @IsOptional()
  @IsEnum(AchievementCategory, { message: 'Danh mục thành tích không hợp lệ' })
  category?: AchievementCategory;

  @IsOptional()
  @IsEnum(AchievementRank, { message: 'Xếp giải thành tích không hợp lệ' })
  rank?: AchievementRank;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID file minh chứng phải là số nguyên' })
  @Min(1)
  evidenceFileId?: number;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;

  @IsOptional()
  @IsEnum(AchievementStatus, { message: 'Trạng thái thành tích không hợp lệ' })
  status?: AchievementStatus;
}
