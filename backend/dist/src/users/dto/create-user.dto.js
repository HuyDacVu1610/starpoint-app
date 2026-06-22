"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
class CreateUserDto {
    studentCode;
    fullName;
    email;
    phone;
    password;
    roleIds;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Mã số sinh viên/mã người dùng không được rỗng' }),
    (0, class_validator_1.IsString)({ message: 'Mã số sinh viên phải là chuỗi' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "studentCode", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Họ và tên không được rỗng' }),
    (0, class_validator_1.IsString)({ message: 'Họ và tên phải là chuỗi' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email không được rỗng' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email không hợp lệ' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Số điện thoại phải là chuỗi' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Mật khẩu không được rỗng' }),
    (0, class_validator_1.MinLength)(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Danh sách ID vai trò không được rỗng' }),
    (0, class_validator_1.IsArray)({ message: 'Danh sách ID vai trò phải là mảng' }),
    (0, class_validator_1.IsNumber)({}, { each: true, message: 'ID vai trò phải là số nguyên' }),
    __metadata("design:type", Array)
], CreateUserDto.prototype, "roleIds", void 0);
//# sourceMappingURL=create-user.dto.js.map