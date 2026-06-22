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
exports.UpdateSemesterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpdateSemesterDto {
    name;
    year;
    term;
    startDate;
    endDate;
}
exports.UpdateSemesterDto = UpdateSemesterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Tên học kỳ phải là chuỗi' }),
    __metadata("design:type", String)
], UpdateSemesterDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Năm học phải là số nguyên' }),
    (0, class_validator_1.Min)(2000, { message: 'Năm học tối thiểu là 2000' }),
    __metadata("design:type", Number)
], UpdateSemesterDto.prototype, "year", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Kỳ học phải là số nguyên' }),
    (0, class_validator_1.Min)(1, { message: 'Kỳ học tối thiểu là 1' }),
    (0, class_validator_1.Max)(2, { message: 'Kỳ học tối đa là 2' }),
    __metadata("design:type", Number)
], UpdateSemesterDto.prototype, "term", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)({ message: 'Ngày bắt đầu không hợp lệ' }),
    __metadata("design:type", Date)
], UpdateSemesterDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)({ message: 'Ngày kết thúc không hợp lệ' }),
    __metadata("design:type", Date)
], UpdateSemesterDto.prototype, "endDate", void 0);
//# sourceMappingURL=update-semester.dto.js.map