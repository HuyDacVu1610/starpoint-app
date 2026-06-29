import { api } from './api';
import type { Semester } from './semesters.service';

export interface Competition {
  id: number;
  name: string;
  level: 'CENTRAL' | 'ACADEMY';
  organizer?: string;
  eventDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ONGOING' | 'ENDED';
  semesterId: number;
  semester?: Semester;
  createdAt?: string;
  updatedAt?: string;
}

export const competitionsService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    semesterId?: number;
    level?: 'CENTRAL' | 'ACADEMY';
  }) => {
    const res = await api.get('/competitions', { params });
    return res.data;
  },

  get: async (id: number) => {
    const res = await api.get(`/competitions/${id}`);
    return res.data;
  },

  create: async (data: Omit<Competition, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'semester'>) => {
    const res = await api.post('/competitions', data);
    return res.data;
  },

  update: async (
    id: number,
    data: Partial<Omit<Competition, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'semester'>>,
  ) => {
    const res = await api.patch(`/competitions/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    const res = await api.delete(`/competitions/${id}`);
    return res.data;
  },
};
