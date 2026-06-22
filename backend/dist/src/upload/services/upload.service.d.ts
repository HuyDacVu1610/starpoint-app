import { PrismaService } from '../../prisma/prisma.service';
export declare class UploadService {
    private readonly prisma;
    private readonly uploadDir;
    private readonly allowedMimeTypes;
    constructor(prisma: PrismaService);
    saveFile(file: Express.Multer.File, userId: number): Promise<{
        id: number;
        originalName: string;
        storedPath: string;
        url: string;
    }>;
}
