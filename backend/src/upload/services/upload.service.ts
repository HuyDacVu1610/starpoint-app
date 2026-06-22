import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads');
  private readonly allowedMimeTypes = [
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

  constructor(private readonly prisma: PrismaService) {
    // Ensure upload directory exists
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, userId: number) {
    if (!file) {
      throw new BadRequestException('Không có file nào được tải lên');
    }

    // Validate size (5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Kích thước file không được vượt quá 5MB');
    }

    // Validate mime type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Định dạng file không được hỗ trợ');
    }

    // Generate unique file name
    const fileExt = extname(file.originalname);
    const fileName = `${randomUUID()}${fileExt}`;
    const filePath = join(this.uploadDir, fileName);

    try {
      // Save file on disk
      writeFileSync(filePath, file.buffer);

      // Save metadata in database
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
    } catch (error) {
      console.error('File upload save error:', error);
      throw new BadRequestException('Có lỗi xảy ra khi lưu file');
    }
  }
}
