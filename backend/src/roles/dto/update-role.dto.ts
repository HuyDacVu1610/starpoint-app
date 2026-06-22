import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString({ message: 'Tên vai trò phải là chuỗi' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @IsOptional()
  @IsArray({ message: 'Danh sách quyền phải là mảng' })
  @IsNumber({}, { each: true, message: 'ID quyền phải là số' })
  permissionIds?: number[];
}
