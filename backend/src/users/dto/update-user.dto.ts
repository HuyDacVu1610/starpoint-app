import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsNumber,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Mã số sinh viên phải là chuỗi' })
  studentCode?: string;

  @IsOptional()
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  phone?: string;

  @IsOptional()
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password?: string;

  @IsOptional()
  @IsArray({ message: 'Danh sách ID vai trò phải là mảng' })
  @IsNumber({}, { each: true, message: 'ID vai trò phải là số nguyên' })
  roleIds?: number[];
}
