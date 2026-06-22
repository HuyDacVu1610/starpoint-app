import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CompetitionLevel } from '@starpointapp/shared';

export class UpdateCompetitionDto {
  @IsOptional()
  @IsString({ message: 'Tên cuộc thi phải là chuỗi' })
  name?: string;

  @IsOptional()
  @IsEnum(CompetitionLevel, {
    message: 'Cấp cuộc thi không hợp lệ (CENTRAL hoặc ACADEMY)',
  })
  level?: CompetitionLevel;

  @IsOptional()
  @IsString({ message: 'Đơn vị tổ chức phải là chuỗi' })
  organizer?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Ngày diễn ra cuộc thi không hợp lệ' })
  eventDate?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID học kỳ phải là số nguyên' })
  @Min(1, { message: 'ID học kỳ phải lớn hơn 0' })
  semesterId?: number;
}
