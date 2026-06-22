import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được rỗng' })
  currentPassword!: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được rỗng' })
  @MinLength(6, { message: 'Mật khẩu mới phải chứa ít nhất 6 ký tự' })
  newPassword!: string;
}
