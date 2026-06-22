import { IsNotEmpty, IsString, IsInt, Min, Max, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSemesterDto {
  @IsNotEmpty({ message: 'Tên học kỳ không được để trống' })
  @IsString({ message: 'Tên học kỳ phải là chuỗi' })
  name!: string;

  @IsNotEmpty({ message: 'Năm học không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Năm học phải là số nguyên' })
  @Min(2000, { message: 'Năm học tối thiểu là 2000' })
  year!: number;

  @IsNotEmpty({ message: 'Kỳ học không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Kỳ học phải là số nguyên' })
  @Min(1, { message: 'Kỳ học tối thiểu là 1' })
  @Max(2, { message: 'Kỳ học tối đa là 2' })
  term!: number;

  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày bắt đầu không hợp lệ' })
  startDate!: Date;

  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày kết thúc không hợp lệ' })
  endDate!: Date;
}
