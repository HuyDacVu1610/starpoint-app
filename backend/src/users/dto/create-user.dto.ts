import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsNumber,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Mã số sinh viên/mã người dùng không được rỗng' })
  @IsString({ message: 'Mã số sinh viên phải là chuỗi' })
  studentCode!: string;

  @IsNotEmpty({ message: 'Họ và tên không được rỗng' })
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  fullName!: string;

  @IsNotEmpty({ message: 'Email không được rỗng' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  phone?: string;

  @IsNotEmpty({ message: 'Mật khẩu không được rỗng' })
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password!: string;

  @IsNotEmpty({ message: 'Danh sách ID vai trò không được rỗng' })
  @IsArray({ message: 'Danh sách ID vai trò phải là mảng' })
  @IsNumber({}, { each: true, message: 'ID vai trò phải là số nguyên' })
  roleIds!: number[];
}
