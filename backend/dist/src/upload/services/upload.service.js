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
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
let UploadService = class UploadService {
    prisma;
    uploadDir = (0, path_1.join)(process.cwd(), 'uploads');
    allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    constructor(prisma) {
        this.prisma = prisma;
        if (!(0, fs_1.existsSync)(this.uploadDir)) {
            (0, fs_1.mkdirSync)(this.uploadDir, { recursive: true });
        }
    }
    async saveFile(file, userId) {
        if (!file) {
            throw new common_1.BadRequestException('Không có file nào được tải lên');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('Kích thước file không được vượt quá 5MB');
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Định dạng file không được hỗ trợ');
        }
        const fileExt = (0, path_1.extname)(file.originalname);
        const fileName = `${(0, crypto_1.randomUUID)()}${fileExt}`;
        const filePath = (0, path_1.join)(this.uploadDir, fileName);
        try {
            (0, fs_1.writeFileSync)(filePath, file.buffer);
            const uploadedFile = await this.prisma.uploadedFile.create({
                data: {
                    originalName: file.originalname,
                    storedPath: fileName,
                    mimeType: file.mimetype,
                    sizeBytes: file.size,
                    uploadedById: userId,
                },
            });
            return {
                id: uploadedFile.id,
                originalName: uploadedFile.originalName,
                storedPath: uploadedFile.storedPath,
                url: `/uploads/${fileName}`,
            };
        }
        catch (error) {
            console.error('File upload save error:', error);
            throw new common_1.BadRequestException('Có lỗi xảy ra khi lưu file');
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UploadService);
//# sourceMappingURL=upload.service.js.map