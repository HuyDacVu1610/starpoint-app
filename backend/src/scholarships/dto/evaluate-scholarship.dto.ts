import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class EvaluateScholarshipDto {
  @IsNotEmpty({ message: 'Mã học kỳ không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Mã học kỳ phải là số nguyên' })
  semesterId!: number;
}
