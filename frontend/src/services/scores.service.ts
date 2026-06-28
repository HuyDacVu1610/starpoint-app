import { api } from './api';
import type { Semester } from './semesters.service';

export interface Score {
  id: number;
  userId: number;
  studentCode: string;
  fullName: string;
  user?: {
    id: number;
    studentCode: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  };
  semesterId: number;
  semester?: Semester;
  gpa: number | null;
  conductScore: number | null;
  gpaGrade?: string | null;
  conductGrade?: string | null;
  bonusPoint: number;
  maxBonusPoint?: number;
  extendedGpa: number;
  createdAt?: string;
  updatedAt?: string;
}

export const scoresService = {
  list: async (params?: { page?: number; limit?: number; search?: string; semesterId?: number; userId?: number }) => {
    const res = await api.get('/scores', { params });
    return res.data;
  },

  listMy: async (params?: { page?: number; limit?: number; semesterId?: number }) => {
    const res = await api.get('/scores/my', { params });
    return res.data;
  },

  import: async (semesterId: number, file: File) => {
    const formData = new FormData();
    formData.append('semesterId', semesterId.toString());
    formData.append('file', file);
    const res = await api.post('/scores/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  updateManualScore: async (
    semesterId: number,
    studentCode: string,
    data: { gpa?: number; conductScore?: number; competitionId?: number | null; rank?: string | null; category?: string | null }
  ) => {
    const res = await api.patch(`/semesters/${semesterId}/students/${studentCode}`, data);
    return res.data;
  },

  calculate: async (semesterId: number) => {
    const res = await api.post(`/scores/calculate/${semesterId}`);
    return res.data;
  },
};
