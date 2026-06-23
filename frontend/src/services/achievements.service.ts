import { api } from './api';
import type { Semester } from './semesters.service';
import type { Competition } from './competitions.service';

export interface UserSummary {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
}

export interface UploadedFileSummary {
  id: number;
  originalName: string;
  storedPath: string;
  mimeType: string;
  sizeBytes: number;
}

export interface Achievement {
  id: number;
  userId: number;
  user?: UserSummary;
  competitionId?: number | null;
  competition?: Competition | null;
  semesterId: number;
  semester?: Semester;
  category: string;
  rank: string;
  bonusPoint: number;
  evidence?: string | null;
  evidenceFileId?: number | null;
  evidenceFile?: UploadedFileSummary | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const achievementsService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    semesterId?: number;
    category?: string;
    status?: string;
  }) => {
    const res = await api.get('/achievements', { params });
    return res.data;
  },

  listMy: async (params?: {
    page?: number;
    limit?: number;
    semesterId?: number;
    category?: string;
    status?: string;
  }) => {
    const res = await api.get('/achievements/my', { params });
    return res.data;
  },

  get: async (id: number) => {
    const res = await api.get(`/achievements/${id}`);
    return res.data;
  },

  create: async (
    data: Omit<
      Achievement,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'user'
      | 'competition'
      | 'semester'
      | 'evidenceFile'
      | 'bonusPoint'
      | 'userId'
      | 'status'
    >,
  ) => {
    const res = await api.post('/achievements', data);
    return res.data;
  },

  update: async (
    id: number,
    data: Partial<
      Omit<
        Achievement,
        | 'id'
        | 'createdAt'
        | 'updatedAt'
        | 'user'
        | 'competition'
        | 'semester'
        | 'evidenceFile'
        | 'bonusPoint'
        | 'userId'
        | 'status'
      >
    >,
  ) => {
    const res = await api.patch(`/achievements/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    const res = await api.delete(`/achievements/${id}`);
    return res.data;
  },

  review: async (id: number, status: 'APPROVED' | 'REJECTED') => {
    const res = await api.patch(`/achievements/${id}/review`, { status });
    return res.data;
  },
};
