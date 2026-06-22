import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyResetCodeDto {
  @IsNotEmpty({ message: 'Mã số sinh viên không được rỗng' })
  @IsString({ message: 'Mã số sinh viên phải là chuỗi' })
  studentCode!: string;

  @IsNotEmpty({ message: 'Mã xác nhận không được rỗng' })
  @IsString({ message: 'Mã xác nhận phải là chuỗi' })
  @Length(6, 6, { message: 'Mã xác nhận phải gồm đúng 6 ký tự' })
  code!: string;
}
