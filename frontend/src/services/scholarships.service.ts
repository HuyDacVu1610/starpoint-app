import { api } from './api';
import type { Semester } from './semesters.service';

export interface ScholarshipCandidate {
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
  gpa: number;
  conductScore: number;
  extendedGpa: number;
  isEligible: boolean;
  scholarshipTier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NONE';
  reasons: string[];
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const scholarshipsService = {
  listCandidates: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    semesterId?: number;
    isEligible?: boolean;
    scholarshipTier?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NONE';
    userId?: number;
  }) => {
    const res = await api.get('/scholarships/candidates', { params });
    return res.data;
  },

  listMy: async (params?: { page?: number; limit?: number; semesterId?: number }) => {
    const res = await api.get('/scholarships/my', { params });
    return res.data;
  },

  evaluate: async (semesterId: number) => {
    const res = await api.post('/scholarships/evaluate', { semesterId });
    return res.data;
  },
};
