import { api } from './api';

export interface UploadResponse {
  id: number;
  originalName: string;
  storedPath: string;
  url: string;
}

export const uploadService = {
  upload: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data || res.data; // Handles standard ResponseInterceptor nesting if present
  },
};
