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
exports.CreateSemesterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateSemesterDto {
    name;
    year;
    term;
    startDate;
    endDate;
}
exports.CreateSemesterDto = CreateSemesterDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên học kỳ không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Tên học kỳ phải là chuỗi' }),
    __metadata("design:type", String)
], CreateSemesterDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Năm học không được để trống' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Năm học phải là số nguyên' }),
    (0, class_validator_1.Min)(2000, { message: 'Năm học tối thiểu là 2000' }),
    __metadata("design:type", Number)
], CreateSemesterDto.prototype, "year", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Kỳ học không được để trống' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Kỳ học phải là số nguyên' }),
    (0, class_validator_1.Min)(1, { message: 'Kỳ học tối thiểu là 1' }),
    (0, class_validator_1.Max)(2, { message: 'Kỳ học tối đa là 2' }),
    __metadata("design:type", Number)
], CreateSemesterDto.prototype, "term", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Ngày bắt đầu không được để trống' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)({ message: 'Ngày bắt đầu không hợp lệ' }),
    __metadata("design:type", Date)
], CreateSemesterDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Ngày kết thúc không được để trống' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)({ message: 'Ngày kết thúc không hợp lệ' }),
    __metadata("design:type", Date)
], CreateSemesterDto.prototype, "endDate", void 0);
//# sourceMappingURL=create-semester.dto.js.map