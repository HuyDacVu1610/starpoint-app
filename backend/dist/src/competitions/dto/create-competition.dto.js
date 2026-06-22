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
exports.CreateCompetitionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const shared_1 = require("@starpointapp/shared");
class CreateCompetitionDto {
    name;
    level;
    organizer;
    eventDate;
    semesterId;
}
exports.CreateCompetitionDto = CreateCompetitionDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên cuộc thi không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Tên cuộc thi phải là chuỗi' }),
    __metadata("design:type", String)
], CreateCompetitionDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Cấp cuộc thi không được để trống' }),
    (0, class_validator_1.IsEnum)(shared_1.CompetitionLevel, {
        message: 'Cấp cuộc thi không hợp lệ (CENTRAL hoặc ACADEMY)',
    }),
    __metadata("design:type", String)
], CreateCompetitionDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Đơn vị tổ chức phải là chuỗi' }),
    __metadata("design:type", String)
], CreateCompetitionDto.prototype, "organizer", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Ngày diễn ra cuộc thi không được để trống' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)({ message: 'Ngày diễn ra cuộc thi không hợp lệ' }),
    __metadata("design:type", Date)
], CreateCompetitionDto.prototype, "eventDate", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Học kỳ không được để trống' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'ID học kỳ phải là số nguyên' }),
    (0, class_validator_1.Min)(1, { message: 'ID học kỳ phải lớn hơn 0' }),
    __metadata("design:type", Number)
], CreateCompetitionDto.prototype, "semesterId", void 0);
//# sourceMappingURL=create-competition.dto.js.map