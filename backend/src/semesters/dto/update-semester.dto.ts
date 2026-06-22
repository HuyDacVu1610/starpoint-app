import { IsOptional, IsString, IsInt, Min, Max, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSemesterDto {
  @IsOptional()
  @IsString({ message: 'Tên học kỳ phải là chuỗi' })
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Năm học phải là số nguyên' })
  @Min(2000, { message: 'Năm học tối thiểu là 2000' })
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Kỳ học phải là số nguyên' })
  @Min(1, { message: 'Kỳ học tối thiểu là 1' })
  @Max(2, { message: 'Kỳ học tối đa là 2' })
  term?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Ngày bắt đầu không hợp lệ' })
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Ngày kết thúc không hợp lệ' })
  endDate?: Date;
}
