import { Request } from 'express';
import { UploadService } from '../services/upload.service';
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
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadFile(file: Express.Multer.File, req: AuthenticatedRequest): Promise<{
        id: number;
        originalName: string;
        storedPath: string;
        url: string;
    }>;
}
export {};
