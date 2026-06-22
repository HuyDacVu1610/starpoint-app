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
exports.QueryAchievementDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const pagination_query_dto_1 = require("../../shared/common/dto/pagination-query.dto");
const shared_1 = require("@starpointapp/shared");
class QueryAchievementDto extends pagination_query_dto_1.PaginationQueryDto {
    semesterId;
    category;
    userId;
    status;
}
exports.QueryAchievementDto = QueryAchievementDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'ID học kỳ phải là số nguyên' }),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryAchievementDto.prototype, "semesterId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.AchievementCategory, { message: 'Danh mục không hợp lệ' }),
    __metadata("design:type", String)
], QueryAchievementDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'ID sinh viên phải là số nguyên' }),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryAchievementDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.AchievementStatus, { message: 'Trạng thái không hợp lệ' }),
    __metadata("design:type", String)
], QueryAchievementDto.prototype, "status", void 0);
//# sourceMappingURL=query-achievement.dto.js.map