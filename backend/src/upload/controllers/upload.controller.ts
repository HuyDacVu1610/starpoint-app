import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request as NestRequest,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { UploadService } from '../services/upload.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

interface UserPayload {
  id: number;
  studentCode: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('Không có file nào được tải lên');
    }
    return this.uploadService.saveFile(file, req.user.id);
  }
}
