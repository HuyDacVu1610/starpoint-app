import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CompetitionLevel } from '@starpointapp/shared';

export class CreateCompetitionDto {
  @IsNotEmpty({ message: 'Tên cuộc thi không được để trống' })
  @IsString({ message: 'Tên cuộc thi phải là chuỗi' })
  name!: string;

  @IsNotEmpty({ message: 'Cấp cuộc thi không được để trống' })
  @IsEnum(CompetitionLevel, {
    message: 'Cấp cuộc thi không hợp lệ (CENTRAL hoặc ACADEMY)',
  })
  level!: CompetitionLevel;

  @IsOptional()
  @IsString({ message: 'Đơn vị tổ chức phải là chuỗi' })
  organizer?: string;

  @IsNotEmpty({ message: 'Ngày diễn ra cuộc thi không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày diễn ra cuộc thi không hợp lệ' })
  eventDate!: Date;

  @IsNotEmpty({ message: 'Học kỳ không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'ID học kỳ phải là số nguyên' })
  @Min(1, { message: 'ID học kỳ phải lớn hơn 0' })
  semesterId!: number;
}
