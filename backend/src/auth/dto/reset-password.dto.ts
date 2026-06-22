import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Mã số sinh viên không được rỗng' })
  @IsString({ message: 'Mã số sinh viên phải là chuỗi' })
  studentCode!: string;

  @IsNotEmpty({ message: 'Mã xác nhận không được rỗng' })
  @IsString({ message: 'Mã xác nhận phải là chuỗi' })
  @Length(6, 6, { message: 'Mã xác nhận phải gồm đúng 6 ký tự' })
  code!: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được rỗng' })
  @MinLength(6, { message: 'Mật khẩu mới phải chứa ít nhất 6 ký tự' })
  newPassword!: string;
}
