import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AchievementCategory,
  AchievementRank,
  AchievementStatus,
} from '@starpointapp/shared';

export class CreateAchievementDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID sinh viên phải là số nguyên' })
  @Min(1, { message: 'ID sinh viên phải lớn hơn 0' })
  userId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID cuộc thi phải là số nguyên' })
  @Min(1, { message: 'ID cuộc thi phải lớn hơn 0' })
  competitionId?: number;

  @IsNotEmpty({ message: 'Học kỳ không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'ID học kỳ phải là số nguyên' })
  @Min(1, { message: 'ID học kỳ phải lớn hơn 0' })
  semesterId!: number;

  @IsNotEmpty({ message: 'Danh mục thành tích không được để trống' })
  @IsEnum(AchievementCategory, { message: 'Danh mục thành tích không hợp lệ' })
  category!: AchievementCategory;

  @IsNotEmpty({ message: 'Xếp giải thành tích không được để trống' })
  @IsEnum(AchievementRank, { message: 'Xếp giải thành tích không hợp lệ' })
  rank!: AchievementRank;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID file minh chứng phải là số nguyên' })
  @Min(1, { message: 'ID file minh chứng phải lớn hơn 0' })
  evidenceFileId?: number;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;

  @IsOptional()
  @IsEnum(AchievementStatus, { message: 'Trạng thái thành tích không hợp lệ' })
  status?: AchievementStatus;
}
