import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Mã số sinh viên không được rỗng' })
  @IsString({ message: 'Mã số sinh viên phải là chuỗi' })
  studentCode!: string;

  @IsNotEmpty({ message: 'Mật khẩu không được rỗng' })
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password!: string;
}
