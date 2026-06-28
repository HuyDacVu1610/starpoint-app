import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportScoreDto {
  @IsNotEmpty({ message: 'Học kỳ không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Học kỳ phải là số nguyên' })
  semesterId!: number;
}
