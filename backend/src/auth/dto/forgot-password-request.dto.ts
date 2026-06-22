import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordRequestDto {
  @IsNotEmpty({ message: 'Mã số sinh viên không được rỗng' })
  @IsString({ message: 'Mã số sinh viên phải là chuỗi' })
  studentCode!: string;

  @IsNotEmpty({ message: 'Email không được rỗng' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;
}
